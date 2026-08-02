import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "docs/qa-screenshots/curated-menu-v1";
fs.mkdirSync(outDir, { recursive: true });
const base = process.env.MENU_QA_BASE || "http://127.0.0.1:3011";
const widths = [390, 768, 1024, 1280, 1440];

const browser = await chromium.launch();
const results = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 768 ? 900 : 960 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle" });
  await page.locator("#menu-heading").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);

  const menu = page.locator("#menu");
  const text = await menu.innerText();
  const checks = {
    width,
    hasNotice: text.includes(
      "Adding a dish to your inquiry does not create a booking",
    ),
    noRepeatedPrefill: !text.includes("Prefills an inquiry"),
    hasAddToInquiry: text.includes("Add to Inquiry"),
    showing78: text.includes("of 78 curated selections"),
    overflow: await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
    ),
    cols: await page.evaluate(() => {
      const grids = [...document.querySelectorAll("#menu .grid")];
      const cardGrid = grids.find((el) =>
        el.className.includes("xl:grid-cols-3"),
      );
      if (!cardGrid) return null;
      return getComputedStyle(cardGrid)
        .gridTemplateColumns.split(" ")
        .filter(Boolean).length;
    }),
  };

  const buttons = menu.getByRole("button", { name: "Add to Inquiry" });
  await buttons.nth(0).click();
  await buttons.nth(1).click();
  const after = await menu.innerText();
  checks.selectedCount = after.includes("2 dishes selected");
  checks.continueVisible = after.includes("Continue to Inquiry");

  await page.screenshot({
    path: path.join(outDir, `menu-${width}.png`),
    fullPage: false,
  });
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

  results.push(checks);
  await context.close();
}

fs.writeFileSync(
  path.join(outDir, "refine-checks.json"),
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
await browser.close();
