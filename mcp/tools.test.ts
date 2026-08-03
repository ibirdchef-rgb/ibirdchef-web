import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MCP_TOOL_NAMES, runMcpTool } from "./tools";

const sampleInput = {
  zipCode: "98109",
  businessType: "ghost_kitchen",
  cuisine: "east_asian",
  investmentBudget: "150_300k",
  ownerExperience: "management",
  facilitySize: "under_1000",
  serviceModel: "delivery",
  targetOpeningDate: "2027-01-15",
};

describe("MCP tools", () => {
  it("registers all four Phase 1 tools", () => {
    assert.deepEqual(MCP_TOOL_NAMES.sort(), [
      "analyze_business_fit",
      "build_startup_budget",
      "compare_food_service_concepts",
      "generate_opening_checklist",
    ].sort());
  });

  it("analyze_business_fit returns a planning report", () => {
    const result = runMcpTool("analyze_business_fit", sampleInput);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.result.planningEstimateOnly, true);
      assert.ok("fitScore" in result.result);
      assert.ok("scoreBreakdown" in result.result);
      assert.ok("nextStepGroups" in result.result);
    }
  });

  it("build_startup_budget returns category ranges", () => {
    const result = runMcpTool("build_startup_budget", sampleInput);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.ok(result.result.total.highUsd > 0);
      assert.ok(result.result.categories.length > 0);
    }
  });

  it("generate_opening_checklist returns local-review categories", () => {
    const result = runMcpTool("generate_opening_checklist", sampleInput);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.ok(result.result.licensingChecklistCategories.length > 0);
      assert.ok(
        result.result.licensingChecklistCategories.every(
          (category) => category.requiresLocalReview,
        ),
      );
      assert.ok(result.result.nextStepGroups.validateBeforeLease.length > 0);
    }
  });

  it("compare_food_service_concepts compares two concepts", () => {
    const result = runMcpTool("compare_food_service_concepts", {
      concepts: [
        { label: "Ghost kitchen A", input: sampleInput },
        {
          label: "Restaurant B",
          input: {
            ...sampleInput,
            businessType: "restaurant",
            serviceModel: "dine_in",
            facilitySize: "2000_4000",
            investmentBudget: "under_50k",
          },
        },
      ],
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.result.concepts.length, 2);
      assert.equal(result.result.planningEstimateOnly, true);
    }
  });

  it("rejects invalid tool input without exposing secrets", () => {
    const result = runMcpTool("analyze_business_fit", {
      ...sampleInput,
      zipCode: "12",
      apiKey: "secret",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "validation_error");
      assert.equal(JSON.stringify(result).includes("secret"), false);
    }
  });
});
