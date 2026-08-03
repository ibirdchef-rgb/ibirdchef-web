import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.UI_BASE ?? "http://localhost:3010";
const outDir = "tmp/business-fit-screenshots";
mkdirSync(outDir, { recursive: true });

async function fillValid(page) {
  await page.locator('input[name="zipCode"]').fill("98101");
  await page.locator('input[name="targetOpeningDate"]').fill("2027-06-01");
}

async function captureViewport(browser, width, height, name) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`${BASE}/business-fit`, { waitUntil: "networkidle" });
  await fillValid(page);
  await page.screenshot({ path: `${outDir}/${name}-form.png`, fullPage: true });
  await page.getByRole("button", { name: /Generate Fit Report/i }).click();
  await page.getByRole("heading", { name: /Food Business Fit Report/i }).waitFor({ timeout: 15000 });
  await page.getByText(/How this score was calculated/i).waitFor();
  await page.screenshot({ path: `${outDir}/${name}-report.png`, fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (overflow) throw new Error(`Horizontal overflow at ${name}`);
  await page.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${BASE}/business-fit`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: `${outDir}/desktop-form.png`, fullPage: true });

  // Client validation error state
  await desktop.locator('input[name="zipCode"]').fill("12");
  await desktop.locator('input[name="targetOpeningDate"]').fill("2027-06-01");
  await desktop.getByRole("button", { name: /Generate Fit Report/i }).click();
  await desktop.getByText(/Enter a valid 5-digit U\.S\. ZIP code/i).waitFor({ timeout: 5000 });
  await desktop.screenshot({ path: `${outDir}/desktop-validation-error.png`, fullPage: true });
  console.log("form_validation_error_ok", true);

  await fillValid(desktop);
  await desktop.getByRole("button", { name: /Generate Fit Report/i }).click();
  await desktop.getByRole("heading", { name: /Food Business Fit Report/i }).waitFor({ timeout: 15000 });
  const focusedAfterReport = await desktop.evaluate(() => document.activeElement?.id);
  console.log("report_focus_id", focusedAfterReport);
  await desktop.screenshot({ path: `${outDir}/desktop-report.png`, fullPage: true });

  // Print preview media
  await desktop.emulateMedia({ media: "print" });
  await desktop.screenshot({ path: `${outDir}/desktop-print-preview.png`, fullPage: true });
  await desktop.emulateMedia({ media: "screen" });
  console.log("print_preview_ok", true);

  await captureViewport(browser, 1024, 900, "tablet");

  // Mobile
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(`${BASE}/business-fit`, { waitUntil: "networkidle" });
  await fillValid(mobile);
  await mobile.screenshot({ path: `${outDir}/mobile-form.png`, fullPage: true });
  await mobile.getByRole("button", { name: /Generate Fit Report/i }).click();
  await mobile.getByRole("heading", { name: /Food Business Fit Report/i }).waitFor({ timeout: 15000 });
  await mobile.screenshot({ path: `${outDir}/mobile-report.png`, fullPage: true });
  const mobileOverflow = await mobile.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  if (mobileOverflow) throw new Error("Horizontal overflow on mobile");

  const printButton = mobile.getByRole("button", { name: /Print \/ Save PDF/i });
  await printButton.waitFor();
  console.log("print_button_visible", await printButton.isVisible());

  // Regression: production nav must not include ANS Food
  const home = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await home.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const headerText = await home.locator("header").innerText();
  if (/ANS Food|Business Fit/i.test(headerText)) {
    throw new Error("ANS link unexpectedly present in production header");
  }
  const concierge =
    (await home.locator("#concierge").count()) +
    (await home.getByText("Catering Concierge").count());
  console.log("concierge_present", concierge > 0);
  if (concierge === 0) {
    throw new Error("Catering Concierge missing from homepage");
  }
  await home.screenshot({ path: `${outDir}/homepage-no-ans-nav.png`, fullPage: false });

  await browser.close();
  console.log("UI_SMOKE_OK");
  console.log(`screenshots_dir ${outDir}`);
}

main().catch((error) => {
  console.error("UI_SMOKE_FAIL", error);
  process.exit(1);
});
