import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAnsFoodBusinessFitMcpServer,
  mcpEventProfitInputSchema,
} from "../src/lib/ans-mcp/create-mcp-server";
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
  it("registers all five Marketplace tools", () => {
    assert.deepEqual(MCP_TOOL_NAMES.sort(), [
      "analyze_business_fit",
      "build_startup_budget",
      "compare_food_service_concepts",
      "generate_opening_checklist",
      "simulate_event_profit",
    ].sort());
  });

  it("annotates every MCP tool as read-only, non-destructive, closed-world", () => {
    const server = createAnsFoodBusinessFitMcpServer();
    const registered = (
      server as unknown as {
        _registeredTools: Record<
          string,
          {
            annotations?: {
              readOnlyHint?: boolean;
              destructiveHint?: boolean;
              idempotentHint?: boolean;
              openWorldHint?: boolean;
            };
            inputSchema?: { safeParse?: (value: unknown) => { success: boolean } };
          }
        >;
      }
    )._registeredTools;

    for (const name of MCP_TOOL_NAMES) {
      const annotations = registered[name]?.annotations;
      assert.equal(annotations?.readOnlyHint, true, name);
      assert.equal(annotations?.destructiveHint, false, name);
      assert.equal(annotations?.idempotentHint, true, name);
      assert.equal(annotations?.openWorldHint, false, name);
    }
  });

  it("rejects unknown fields at the MCP transport schema boundary", () => {
    const server = createAnsFoodBusinessFitMcpServer();
    const registered = (
      server as unknown as {
        _registeredTools: Record<
          string,
          {
            inputSchema: {
              safeParse: (value: unknown) => { success: boolean };
            };
          }
        >;
      }
    )._registeredTools;

    const parsed = registered.simulate_event_profit.inputSchema.safeParse({
      guestCount: 10,
      customerBudgetUsd: 500,
      proposedSellingPriceUsd: 600,
      foodCostUsd: 100,
      laborCostUsd: 100,
      tenantId: "cross-tenant",
    });
    assert.equal(parsed.success, false);

    const direct = mcpEventProfitInputSchema.safeParse({
      guestCount: 10,
      customerBudgetUsd: 500,
      proposedSellingPriceUsd: 600,
      foodCostUsd: 100,
      laborCostUsd: 100,
      tenantId: "cross-tenant",
    });
    assert.equal(direct.success, false);
  });


  it("simulate_event_profit returns the approved demonstration decision", () => {
    const result = runMcpTool("simulate_event_profit", {
      guestCount: 150,
      customerBudgetUsd: 3500,
      proposedSellingPriceUsd: 4125,
      foodCostUsd: 1120,
      laborCostUsd: 620,
      packagingCostUsd: 185,
      deliveryCostUsd: 145,
      capacityStatus: "available_for_planning",
      serviceRegion: "seattle",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.result.totalKnownCostUsd, 2070);
      assert.equal(result.result.expectedProfitUsd, 2055);
      assert.equal(result.result.expectedMarginPercent, 49.82);
      assert.equal(result.result.decisionState, "Budget mismatch");
      assert.equal(result.result.humanApprovalRequired, true);
    }
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
