import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildBusinessFitReport,
  buildOpeningChecklistResult,
  buildStartupBudgetResult,
  compareFoodServiceConcepts,
  estimateOpeningTimeline,
  estimateStartupBudget,
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
    if (parsed.ok) {
      assert.equal(parsed.data.zipCode, "98101");
    }
  });

  it("rejects invalid ZIP codes", () => {
    const parsed = parseBusinessFitInput({ ...baseInput, zipCode: "9810" });
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.ok(parsed.error.issues.some((issue) => issue.path === "zipCode"));
    }
  });

  it("rejects unknown fields (strict schema)", () => {
    const parsed = parseBusinessFitInput({ ...baseInput, email: "x@y.com" });
    assert.equal(parsed.ok, false);
  });

  it("rejects invalid budget enum", () => {
    const parsed = parseBusinessFitInput({
      ...baseInput,
      investmentBudget: "millionaire",
    });
    assert.equal(parsed.ok, false);
  });

  it("rejects invalid facility size", () => {
    const parsed = parseBusinessFitInput({
      ...baseInput,
      facilitySize: "stadium",
    });
    assert.equal(parsed.ok, false);
  });

  it("rejects invalid calendar dates", () => {
    const parsed = parseBusinessFitInput({
      ...baseInput,
      targetOpeningDate: "2027-02-30",
    });
    assert.equal(parsed.ok, false);
  });
});

describe("deterministic scoring", () => {
  it("is deterministic for identical inputs", () => {
    const a = scoreBusinessFit(baseInput, FIXED_NOW);
    const b = scoreBusinessFit(baseInput, FIXED_NOW);
    assert.deepEqual(a, b);
    assert.ok(a.fitScore >= 0 && a.fitScore <= 100);
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

  it("surfaces missing information for unknown budget and facility", () => {
    const scored = scoreBusinessFit(
      {
        ...baseInput,
        investmentBudget: "unknown",
        facilitySize: "unknown",
        ownerExperience: "none",
        cuisine: "other",
      },
      FIXED_NOW,
    );
    assert.ok(scored.missingInformation.length >= 3);
    assert.equal(scored.confidence, "low");
  });
});

describe("budget calculations", () => {
  it("returns positive ranges with planning-estimate labels", () => {
    const budget = estimateStartupBudget(baseInput);
    assert.ok(budget.total.lowUsd > 0);
    assert.ok(budget.total.highUsd > budget.total.lowUsd);
    assert.match(budget.total.label, /planning estimate/i);
    assert.ok(budget.categories.length >= 4);
  });

  it("increases restaurant totals vs food truck for similar facility assumptions", () => {
    const truck = estimateStartupBudget({
      ...baseInput,
      businessType: "food_truck",
      facilitySize: "mobile_or_shared",
      serviceModel: "food_truck",
    });
    const restaurant = estimateStartupBudget({
      ...baseInput,
      businessType: "restaurant",
      facilitySize: "2000_4000",
      serviceModel: "dine_in",
    });
    assert.ok(restaurant.total.lowUsd > truck.total.lowUsd);
  });

  it("buildStartupBudgetResult versions output", () => {
    const result = buildStartupBudgetResult(baseInput, { now: FIXED_NOW });
    assert.equal(result.reportVersion, REPORT_VERSION);
    assert.equal(result.estimatorVersion, ESTIMATOR_VERSION);
    assert.equal(result.planningEstimateOnly, true);
  });
});

describe("timeline generation", () => {
  it("produces optimistic < typical < conservative months", () => {
    const timeline = estimateOpeningTimeline(baseInput, FIXED_NOW);
    assert.ok(timeline.optimisticMonths < timeline.typicalMonths);
    assert.ok(timeline.typicalMonths < timeline.conservativeMonths);
  });

  it("marks aggressive targets as not feasible", () => {
    const timeline = estimateOpeningTimeline(
      { ...baseInput, businessType: "restaurant", targetOpeningDate: "2026-09-01" },
      FIXED_NOW,
    );
    assert.equal(timeline.targetDateFeasible, false);
  });
});

describe("concept comparison", () => {
  it("requires 2–3 concepts", () => {
    const parsed = parseCompareConceptsInput({
      concepts: [{ label: "Only one", input: baseInput }],
    });
    assert.equal(parsed.ok, false);
  });

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
    assert.equal(result.concepts.length, 2);
    assert.ok(result.concepts[0].fitScore >= result.concepts[1].fitScore);
    assert.equal(result.planningEstimateOnly, true);
  });
});

describe("report versioning and checklist", () => {
  it("includes version metadata, disclaimers, and not_connected sources", () => {
    const report = buildBusinessFitReport(baseInput, { now: FIXED_NOW });
    assert.equal(report.reportVersion, REPORT_VERSION);
    assert.equal(report.estimatorVersion, ESTIMATOR_VERSION);
    assert.equal(report.generatedAt, FIXED_NOW.toISOString());
    assert.equal(report.planningEstimateOnly, true);
    assert.ok(report.disclaimers.length >= 4);
    assert.ok(
      report.dataSources.some(
        (source) =>
          source.domain === "demographics_demand" && source.kind === "not_connected",
      ),
    );
  });

  it("builds opening checklist categories with local-review flags", () => {
    const checklist = buildOpeningChecklistResult(
      { ...baseInput, businessType: "food_truck", serviceModel: "food_truck" },
      { now: FIXED_NOW },
    );
    assert.ok(checklist.licensingChecklistCategories.length >= 3);
    assert.ok(
      checklist.licensingChecklistCategories.every((category) => category.requiresLocalReview),
    );
    assert.ok(checklist.equipmentCategories.includes("Mobile kitchen vehicle systems"));
  });
});
