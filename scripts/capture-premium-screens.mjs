import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "docs/qa-screenshots/premium-v1";
fs.mkdirSync(outDir, { recursive: true });
const base = "http://127.0.0.1:3001";
const widths = [390, 768, 1024, 1280, 1440];
const pages = [
  { path: "/", name: "home" },
  { path: "/seattle", name: "seattle" },
  { path: "/bay-area", name: "bay-area" },
  { path: "/private-events", name: "private-events" },
];

const browser = await chromium.launch();
const results = [];

for (const pageDef of pages) {
  for (const width of widths) {
    const context = await browser.newContext({
      viewport: { width, height: width <= 768 ? 844 : 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.goto(base + pageDef.path, { waitUntil: "networkidle" });
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const file = path.join(outDir, `${pageDef.name}-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    results.push(file);
    await context.close();
  }
}

const desk = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const dpage = await desk.newPage();
await dpage.goto(`${base}/`, { waitUntil: "networkidle" });
await dpage.screenshot({
  path: path.join(outDir, "home-desktop-hero.png"),
});
await desk.close();

const mob = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const mpage = await mob.newPage();
await mpage.goto(`${base}/`, { waitUntil: "networkidle" });
await mpage.screenshot({
  path: path.join(outDir, "home-mobile-hero.png"),
});
await mob.close();

const check = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const cpage = await check.newPage();
await cpage.goto(`${base}/`, { waitUntil: "networkidle" });
const body = await cpage.locator("body").innerText();
const checks = {
  greaterSeattle: body.includes("Greater Seattle"),
  bayArea:
    body.includes("San Francisco Bay Area") || body.includes("Bay Area"),
  comingSoon: body.includes("Coming soon"),
  noHaywardStreet: !/22450|Hayward,\s*CA\s*\d/i.test(body),
  planningLanguage:
    body.includes("Share your event details") &&
    body.includes("iBirdChef follows up"),
  seasonalPrice: body.includes("$18"),
};
fs.writeFileSync(
  path.join(outDir, "checks.json"),
  JSON.stringify({ checks, screenshots: results }, null, 2),
);
console.log(JSON.stringify(checks, null, 2));
await check.close();
await browser.close();
console.log(`Wrote ${results.length + 2} screenshots`);
