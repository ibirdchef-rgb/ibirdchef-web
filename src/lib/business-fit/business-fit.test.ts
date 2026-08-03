import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BUDGET_CATEGORY_NAMES,
  buildBusinessFitReport,
  buildOpeningChecklistResult,
  buildStartupBudgetResult,
  compareFoodServiceConcepts,
  estimateOpeningTimeline,
  estimateStartupBudget,
  fitBandForScore,
  parseBusinessFitInput,
  parseCompareConceptsInput,
  scoreBusinessFit,
  ESTIMATOR_VERSION,
  REPORT_VERSION,
  type BusinessFitInput,
} from "@/lib/business-fit";

const FIXED_NOW = new Date("2026-08-02T12:00:00.000Z");

const baseInput: BusinessFitInput = {
  zipCode: "98101",
  businessType: "cafe",
  cuisine: "american",
  investmentBudget: "150_300k",
  ownerExperience: "some_food_service",
  facilitySize: "under_1000",
  serviceModel: "dine_in",
  targetOpeningDate: "2027-06-01",
};

describe("business-fit input validation", () => {
  it("accepts a valid payload", () => {
    const parsed = parseBusinessFitInput(baseInput);
    assert.equal(parsed.ok, true);
  });

  it("rejects invalid ZIP codes", () => {
    const parsed = parseBusinessFitInput({ ...baseInput, zipCode: "9810" });
    assert.equal(parsed.ok, false);
  });

  it("rejects unknown fields (strict schema)", () => {
    const parsed = parseBusinessFitInput({ ...baseInput, email: "x@y.com" });
    assert.equal(parsed.ok, false);
  });
});

describe("deterministic scoring and breakdown", () => {
  it("is deterministic for identical inputs", () => {
    const a = scoreBusinessFit(baseInput, FIXED_NOW);
    const b = scoreBusinessFit(baseInput, FIXED_NOW);
    assert.deepEqual(a, b);
  });

  it("score breakdown totals equal the final score", () => {
    const scored = scoreBusinessFit(baseInput, FIXED_NOW);
    const sum = scored.scoreBreakdown.contributions.reduce(
      (total, row) => total + row.points,
      0,
    );
    assert.equal(sum, scored.fitScore);
    assert.equal(scored.scoreBreakdown.total, scored.fitScore);
    assert.ok(
      scored.scoreBreakdown.contributions.some((row) => row.key === "budget_alignment"),
    );
    assert.ok(
      scored.scoreBreakdown.contributions.some((row) => row.key === "timeline_feasibility"),
    );
    assert.ok(
      scored.scoreBreakdown.contributions.some((row) => row.key === "owner_experience"),
    );
    assert.ok(
      scored.scoreBreakdown.contributions.some(
        (row) => row.key === "facility_service_alignment",
      ),
    );
    assert.ok(
      scored.scoreBreakdown.contributions.some((row) => row.key === "concept_complexity"),
    );
  });

  it("uses Phase 1.1 score-band boundaries", () => {
    assert.equal(fitBandForScore(80), "strong");
    assert.equal(fitBandForScore(79), "promising");
    assert.equal(fitBandForScore(65), "promising");
    assert.equal(fitBandForScore(64), "moderate");
    assert.equal(fitBandForScore(50), "moderate");
    assert.equal(fitBandForScore(49), "weak");
  });

  it("scores underfunded concepts lower than well-funded ones", () => {
    const weak = scoreBusinessFit(
      { ...baseInput, businessType: "restaurant", investmentBudget: "under_50k" },
      FIXED_NOW,
    );
    const strong = scoreBusinessFit(
      { ...baseInput, businessType: "restaurant", investmentBudget: "over_500k" },
      FIXED_NOW,
    );
    assert.ok(strong.fitScore > weak.fitScore);
  });
});

describe("budget calculations", () => {
  it("includes required categories that reconcile to total low/high", () => {
    const budget = estimateStartupBudget(baseInput);
    assert.deepEqual(
      budget.categories.map((category) => category.category),
      [...BUDGET_CATEGORY_NAMES],
    );
    const lowSum = budget.categories.reduce((sum, category) => sum + category.range.lowUsd, 0);
    const highSum = budget.categories.reduce(
      (sum, category) => sum + category.range.highUsd,
      0,
    );
    assert.equal(lowSum, budget.total.lowUsd);
    assert.equal(highSum, budget.total.highUsd);
  });
});

describe("timeline generation", () => {
  it("marks aggressive and unrealistic target dates", () => {
    const aggressive = estimateOpeningTimeline(
      { ...baseInput, businessType: "restaurant", targetOpeningDate: "2026-12-01" },
      FIXED_NOW,
    );
    assert.ok(
      aggressive.targetDateStatus === "aggressive" ||
        aggressive.targetDateStatus === "unrealistic",
    );

    const unrealistic = estimateOpeningTimeline(
      { ...baseInput, businessType: "restaurant", targetOpeningDate: "2026-09-01" },
      FIXED_NOW,
    );
    assert.equal(unrealistic.targetDateStatus, "unrealistic");
    assert.equal(unrealistic.targetDateFeasible, false);
  });

  it("includes the six opening phases", () => {
    const timeline = estimateOpeningTimeline(baseInput, FIXED_NOW);
    assert.equal(timeline.phases.length, 6);
    assert.equal(timeline.phases[0].name, "Concept validation");
    assert.equal(timeline.phases.at(-1)?.name, "Inspection and opening");
  });
});

describe("next steps and missing information", () => {
  it("returns structured next-step groups", () => {
    const report = buildBusinessFitReport(baseInput, { now: FIXED_NOW });
    assert.ok(report.nextStepGroups.doNow.length > 0);
    assert.ok(report.nextStepGroups.validateBeforeLease.length > 0);
    assert.ok(report.nextStepGroups.completeBeforeOpening.length > 0);
    assert.equal(
      report.nextSteps.length,
      report.nextStepGroups.doNow.length +
        report.nextStepGroups.validateBeforeLease.length +
        report.nextStepGroups.completeBeforeOpening.length,
    );
  });

  it("lists specific missing-information planning gaps", () => {
    const scored = scoreBusinessFit(baseInput, FIXED_NOW);
    assert.ok(scored.missingInformation.some((item) => /monthly rent/i.test(item)));
    assert.ok(scored.missingInformation.some((item) => /working capital/i.test(item)));
    assert.ok(scored.missingInformation.some((item) => /seating capacity/i.test(item)));
    assert.ok(scored.missingInformation.some((item) => /staffing plan/i.test(item)));
    assert.ok(scored.missingInformation.some((item) => /average check/i.test(item)));
    assert.ok(scored.missingInformation.some((item) => /daily transactions/i.test(item)));
    assert.ok(scored.missingInformation.some((item) => /permit requirements/i.test(item)));
    assert.ok(scored.missingInformation.some((item) => /Competitive-market/i.test(item)));
  });
});

describe("report versioning and print-safe data", () => {
  it("includes version metadata, score interpretation, and print summary", () => {
    const report = buildBusinessFitReport(baseInput, { now: FIXED_NOW });
    assert.equal(report.reportVersion, REPORT_VERSION);
    assert.equal(report.estimatorVersion, ESTIMATOR_VERSION);
    assert.equal(report.planningEstimateOnly, true);
    assert.ok(report.fitInterpretation.length > 0);
    assert.equal(report.printSummary.includeLogo, true);
    assert.equal(report.printSummary.hideControls, true);
    assert.ok(report.printSummary.inputSummary.some((line) => line.includes("98101")));
    assert.equal(
      report.printSummary.inputSummary.some((line) => /https?:\/\//i.test(line)),
      false,
    );
  });

  it("keeps checklist local-review flags", () => {
    const checklist = buildOpeningChecklistResult(
      { ...baseInput, businessType: "food_truck", serviceModel: "food_truck" },
      { now: FIXED_NOW },
    );
    assert.ok(checklist.nextStepGroups.doNow.length > 0);
    assert.ok(
      checklist.licensingChecklistCategories.every((category) => category.requiresLocalReview),
    );
  });
});

describe("concept comparison", () => {
  it("ranks concepts by fit score descending", () => {
    const result = compareFoodServiceConcepts(
      [
        {
          label: "Thin capital restaurant",
          input: {
            ...baseInput,
            businessType: "restaurant",
            investmentBudget: "under_50k",
            facilitySize: "2000_4000",
          },
        },
        {
          label: "Funded cafe",
          input: baseInput,
        },
      ],
      { now: FIXED_NOW },
    );
    assert.ok(result.concepts[0].fitScore >= result.concepts[1].fitScore);
  });

  it("requires 2–3 concepts", () => {
    const parsed = parseCompareConceptsInput({
      concepts: [{ label: "Only one", input: baseInput }],
    });
    assert.equal(parsed.ok, false);
  });
});

describe("startup budget result versioning", () => {
  it("versions budget tool output", () => {
    const result = buildStartupBudgetResult(baseInput, { now: FIXED_NOW });
    assert.equal(result.reportVersion, REPORT_VERSION);
    assert.equal(result.categories.length, BUDGET_CATEGORY_NAMES.length);
  });
});
