import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE =
  process.env.UI_BASE ??
  "https://ibirdchef-web-git-feature-ans-f-aa3b7f-ibirdchef-5684s-projects.vercel.app";
const outDir = "tmp/business-fit-screenshots/pre-merge-qa";
mkdirSync(outDir, { recursive: true });

const findings = [];

function note(msg) {
  findings.push(msg);
  console.log(msg);
}

async function fillValid(page) {
  await page.locator('input[name="zipCode"]').fill("98101");
  await page.locator('input[name="targetOpeningDate"]').fill("2027-06-01");
}

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  );
  if (overflow) note(`DEFECT: horizontal overflow at ${label}`);
  else note(`OK: no horizontal overflow at ${label}`);
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Homepage branding regression
  const home = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await home.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  const headerText = await home.locator("header").innerText();
  if (/ANS Food|Business Fit/i.test(headerText)) {
    note("DEFECT: ANS branding present in homepage/header nav");
  } else {
    note("OK: homepage/header has no ANS Food Business Fit nav");
  }
  const logoAlt = await home.locator('header img').first().getAttribute("alt");
  note(`homepage_logo_alt=${logoAlt}`);
  await home.screenshot({ path: `${outDir}/homepage-header.png`, fullPage: false });
  await home.close();

  // Desktop form + validation + completed report
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktop.goto(`${BASE}/business-fit`, { waitUntil: "networkidle", timeout: 60000 });
  await desktop.screenshot({ path: `${outDir}/desktop-1440-form.png`, fullPage: true });

  const logoBox = await desktop.locator('img[alt="ANS Food Service OS"]').first().boundingBox();
  note(`logo_box=${JSON.stringify(logoBox)}`);
  if (!logoBox || logoBox.width < 160 || logoBox.height < 40) {
    note("DEFECT: logo too small or missing");
  } else {
    note("OK: blue ANS logo present with readable size");
  }

  await desktop.locator('input[name="zipCode"]').fill("12");
  await desktop.locator('input[name="targetOpeningDate"]').fill("2027-06-01");
  await desktop.getByRole("button", { name: /Generate Fit Report/i }).click();
  await desktop.getByText(/Enter a valid 5-digit U\.S\. ZIP code/i).waitFor({ timeout: 8000 });
  await desktop.screenshot({ path: `${outDir}/desktop-1440-validation.png`, fullPage: true });
  note("OK: validation error state");

  await fillValid(desktop);
  await desktop.getByRole("button", { name: /Generate Fit Report/i }).click();
  await desktop.getByRole("heading", { name: /Food Business Fit Report/i }).waitFor({ timeout: 20000 });
  await desktop.getByText(/How this score was calculated/i).waitFor();
  await desktop.getByText(/Do now/i).waitFor();
  await desktop.getByText(/Validate before signing a lease/i).waitFor();
  await desktop.getByText(/Complete before opening/i).waitFor();
  await desktop.getByText(/Missing information/i).waitFor();
  await assertNoOverflow(desktop, "desktop-1440-report");
  await desktop.screenshot({ path: `${outDir}/desktop-1440-report.png`, fullPage: true });

  // Parse score reconciliation from UI
  const scoreText = await desktop
    .locator("p", { hasText: /^Fit score$/ })
    .locator("xpath=..")
    .innerText();
  note(`score_card=${scoreText.replace(/\s+/g, " ").trim()}`);
  const totalRow = await desktop
    .locator("li", { hasText: /^Total fit score/ })
    .innerText();
  note(`total_row=${totalRow.replace(/\s+/g, " ").trim()}`);

  // Print preview (controls use .ans-no-print { display:none })
  await desktop.emulateMedia({ media: "print" });
  const printVisibility = await desktop.evaluate(() => {
    const form = document.querySelector("form");
    const printBtn = Array.from(document.querySelectorAll("button")).find((btn) =>
      /Print\s*\/\s*Save PDF/i.test(btn.textContent || ""),
    );
    const hidden = (el) => {
      if (!el) return true;
      const style = window.getComputedStyle(el);
      return style.display === "none" || style.visibility === "hidden";
    };
    return {
      formHidden: hidden(form),
      printBtnHidden: hidden(printBtn),
      reportVisible: Boolean(document.getElementById("fit-report-heading")),
    };
  });
  note(`print_form_hidden=${printVisibility.formHidden}`);
  note(`print_button_hidden=${printVisibility.printBtnHidden}`);
  note(`print_report_visible=${printVisibility.reportVisible}`);
  if (!printVisibility.formHidden) note("DEFECT: form still visible in print media");
  if (!printVisibility.printBtnHidden) note("DEFECT: print button still visible in print media");
  await desktop.screenshot({ path: `${outDir}/desktop-1440-print.png`, fullPage: true });
  await desktop.emulateMedia({ media: "screen" });
  await desktop.close();

  // Tablet
  const tablet = await browser.newPage({ viewport: { width: 1024, height: 900 } });
  await tablet.goto(`${BASE}/business-fit`, { waitUntil: "networkidle", timeout: 60000 });
  await fillValid(tablet);
  await tablet.screenshot({ path: `${outDir}/tablet-1024-form.png`, fullPage: true });
  await tablet.getByRole("button", { name: /Generate Fit Report/i }).click();
  await tablet.getByRole("heading", { name: /Food Business Fit Report/i }).waitFor({ timeout: 20000 });
  await assertNoOverflow(tablet, "tablet-1024-report");
  await tablet.screenshot({ path: `${outDir}/tablet-1024-report.png`, fullPage: true });
  await tablet.close();

  // Mobile
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(`${BASE}/business-fit`, { waitUntil: "networkidle", timeout: 60000 });
  await fillValid(mobile);
  await mobile.screenshot({ path: `${outDir}/mobile-390-form.png`, fullPage: true });
  await mobile.getByRole("button", { name: /Generate Fit Report/i }).click();
  await mobile.getByRole("heading", { name: /Food Business Fit Report/i }).waitFor({ timeout: 20000 });
  await assertNoOverflow(mobile, "mobile-390-report");
  await mobile.screenshot({ path: `${outDir}/mobile-390-report.png`, fullPage: true });
  await mobile.close();

  // API-level reconciliation against preview
  const apiRes = await fetch(`${BASE}/api/business-fit`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      zipCode: "98101",
      businessType: "cafe",
      cuisine: "american",
      investmentBudget: "150_300k",
      ownerExperience: "some_food_service",
      facilitySize: "under_1000",
      serviceModel: "dine_in",
      targetOpeningDate: "2027-06-01",
    }),
  });
  const apiJson = await apiRes.json();
  if (!apiJson.ok) {
    note(`DEFECT: API failed ${apiRes.status}`);
  } else {
    const report = apiJson.report;
    const sum = report.scoreBreakdown.contributions.reduce((a, c) => a + c.points, 0);
    if (sum !== report.fitScore || report.scoreBreakdown.total !== report.fitScore) {
      note(`DEFECT: score mismatch sum=${sum} total=${report.scoreBreakdown.total} fit=${report.fitScore}`);
    } else {
      note(`OK: score reconciles to ${report.fitScore}`);
    }
    const lowSum = report.startupBudget.categories.reduce((a, c) => a + c.range.lowUsd, 0);
    const highSum = report.startupBudget.categories.reduce((a, c) => a + c.range.highUsd, 0);
    if (lowSum !== report.startupBudget.total.lowUsd || highSum !== report.startupBudget.total.highUsd) {
      note(`DEFECT: budget mismatch low ${lowSum}/${report.startupBudget.total.lowUsd} high ${highSum}/${report.startupBudget.total.highUsd}`);
    } else {
      note("OK: budget categories reconcile");
    }
    note(`fitBand=${report.fitBand} interpretation=${report.fitInterpretation}`);
    note(`timelineStatus=${report.openingTimeline.targetDateStatus}`);
    note(`nextSteps=${Object.keys(report.nextStepGroups).join(",")}`);
    note(`missingCount=${report.missingInformation.length}`);
    writeFileSync(`${outDir}/sample-report.json`, JSON.stringify(report, null, 2));
  }

  writeFileSync(`${outDir}/findings.txt`, findings.join("\n"));
  await browser.close();
  console.log("PREVIEW_QA_DONE");
  console.log(`preview_base=${BASE}`);
}

main().catch((error) => {
  console.error("PREVIEW_QA_FAIL", error);
  process.exit(1);
});
