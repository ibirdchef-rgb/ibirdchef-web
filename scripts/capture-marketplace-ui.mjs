import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.UI_BASE ?? "http://localhost:3020";
const outDir = "tmp/business-fit-screenshots/marketplace-foundation";
mkdirSync(outDir, { recursive: true });

async function fill(page) {
  await page.locator('input[name="zipCode"]').fill("98101");
  await page.locator('input[name="targetOpeningDate"]').fill("2027-06-01");
}

const browser = await chromium.launch({ headless: true });
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await desktop.goto(`${BASE}/business-fit`, { waitUntil: "networkidle" });
await fill(desktop);
await desktop.getByRole("button", { name: /Generate my fit report/i }).click();
await desktop.locator("#fit-report-heading").waitFor({ timeout: 15000 });
await desktop.screenshot({ path: `${outDir}/desktop-report.png`, fullPage: true });
await desktop.emulateMedia({ media: "print" });
await desktop.screenshot({ path: `${outDir}/print-preview.png`, fullPage: true });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(`${BASE}/business-fit`, { waitUntil: "networkidle" });
await fill(mobile);
await mobile.getByRole("button", { name: /Generate my fit report/i }).click();
await mobile.locator("#fit-report-heading").waitFor({ timeout: 15000 });
await mobile.screenshot({ path: `${outDir}/mobile-report.png`, fullPage: true });
await browser.close();
console.log("report_screens_ok");
