import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.UI_BASE ?? "http://localhost:3010";
const outDir = "tmp/business-fit-screenshots";
mkdirSync(outDir, { recursive: true });

async function fillValid(page) {
  await page.locator('input[name="zipCode"]').fill("98101");
  await page.locator('input[name="targetOpeningDate"]').fill("2027-06-01");
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await desktop.goto(`${BASE}/business-fit`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: `${outDir}/desktop-form.png`, fullPage: true });

  // Client validation error state
  await desktop.fill('input[name="zipCode"]', "12");
  await desktop.fill('input[name="targetOpeningDate"]', "2027-06-01");
  await desktop.getByRole("button", { name: /Generate Fit Report/i }).click();
  await desktop.getByText(/Enter a valid 5-digit U\.S\. ZIP code/i).waitFor({ timeout: 5000 });
  await desktop.screenshot({ path: `${outDir}/desktop-validation-error.png`, fullPage: true });
  console.log("form_validation_error_ok", true);

  await fillValid(desktop);
  await desktop.getByRole("button", { name: /Generate Fit Report/i }).click();
  await desktop.getByText("Generating report").waitFor({ timeout: 5000 }).catch(() => {});
  await desktop.getByRole("heading", { name: /Food Business Fit Report/i }).waitFor({ timeout: 15000 });
  await desktop.screenshot({ path: `${outDir}/desktop-report.png`, fullPage: true });

  // Keyboard focus path
  await desktop.keyboard.press("Tab");
  const focused = await desktop.evaluate(() => document.activeElement?.tagName);
  console.log("keyboard_focus_tag", focused);

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

  // Print CSS path exists
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
