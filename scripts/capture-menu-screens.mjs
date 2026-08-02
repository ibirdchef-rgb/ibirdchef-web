import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "docs/qa-screenshots/curated-menu-v1";
fs.mkdirSync(outDir, { recursive: true });
const base = process.env.MENU_QA_BASE || "http://127.0.0.1:3000";
const widths = [390, 768, 1024, 1280, 1440];

const browser = await chromium.launch();
const results = [];
const a11y = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 768 ? 900 : 960 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.locator("#menu").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      hasHorizontalOverflow: doc.scrollWidth > doc.clientWidth + 1,
    };
  });

  // Keyboard focus visibility sample
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const focusTag = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    const styles = window.getComputedStyle(el);
    return {
      tag: el.tagName,
      outline: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
    };
  });

  const body = await page.locator("body").innerText();
  const checks = {
    width,
    itemCountHint: body.includes("of 78 curated selections"),
    seasonalPrice: body.includes("$18"),
    availability: body.includes("Availability confirmed after event review"),
    dietaryNotice: body.includes(
      "Dietary and allergen information is provided as a planning guide",
    ),
    liveProposal: body.includes("Chef-approved custom proposal"),
    noHaywardStreet: !/32681|Mission Blvd/i.test(body),
    noLegacyPackagePrice: !/\$40\b|\$50\b|\$100\b/.test(body),
    noSourceFilenames:
      !/IBIRDCHEF MENU\.xlsx|INDIAN CATERING MENU/i.test(body),
    hasAskAbout: body.includes("Ask About This Dish"),
    overflow,
    focusTag,
  };
  a11y.push(checks);

  const file = path.join(outDir, `menu-${width}.png`);
  await page.screenshot({ path: file, fullPage: false });
  results.push(file);

  if (width === 1280) {
    await page.screenshot({
      path: path.join(outDir, "menu-desktop-1280.png"),
      fullPage: false,
    });
  }
  if (width === 390) {
    await page.screenshot({
      path: path.join(outDir, "menu-mobile-390.png"),
      fullPage: false,
    });
  }

  // Prefill check at 1280
  if (width === 1280) {
    await page.goto(
      `${base}/?askDish=${encodeURIComponent("Butter Chicken")}&askCategory=${encodeURIComponent("Chicken, Lamb & Goat Entrées")}#contact`,
      { waitUntil: "networkidle" },
    );
    const message = await page.locator('textarea[name="message"]').inputValue();
    checks.prefillWorks = message.includes("Butter Chicken");
    await page.screenshot({
      path: path.join(outDir, "inquiry-prefill-1280.png"),
      fullPage: false,
    });
  }

  await context.close();
}

// Privacy noindex check
const priv = await browser.newContext();
const ppage = await priv.newPage();
await ppage.goto(`${base}/privacy`, { waitUntil: "networkidle" });
const robots = await ppage
  .locator('meta[name="robots"]')
  .getAttribute("content");
fs.writeFileSync(
  path.join(outDir, "checks.json"),
  JSON.stringify(
    {
      a11y,
      screenshots: results,
      privacyRobots: robots,
      privacyNoIndex: /noindex/i.test(robots || ""),
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      widths: a11y.map((c) => ({
        width: c.width,
        overflow: c.overflow.hasHorizontalOverflow,
        itemCountHint: c.itemCountHint,
        prefillWorks: c.prefillWorks ?? null,
      })),
      privacyRobots: robots,
    },
    null,
    2,
  ),
);
await priv.close();
await browser.close();
