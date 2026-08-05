import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runMcpTool } from "../../../mcp/tools";

const PLANNING_GUARDRAIL =
  " Returns preliminary planning estimates only. Not legal, tax, accounting, investment, licensing, financing, or guaranteed financial advice. No live market, competition, revenue, or ROI data. Local professional verification is required before decisions.";

const READ_ONLY_CLOSED_WORLD = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

const businessFitShape = {
  zipCode: z
    .string()
    .max(16)
    .describe("5-digit U.S. ZIP code used for planning context only (no live demographic feed)."),
  businessType: z
    .string()
    .max(40)
    .describe(
      "One of: restaurant, cafe, food_truck, ghost_kitchen, catering, bakery, hybrid",
    ),
  cuisine: z
    .string()
    .max(40)
    .describe(
      "One of: american, south_asian, east_asian, latin, mediterranean, bakery_dessert, multi_cuisine, other",
    ),
  investmentBudget: z
    .string()
    .max(40)
    .describe(
      "Budget band: under_50k, 50_150k, 150_300k, 300_500k, over_500k, unknown",
    ),
  ownerExperience: z
    .string()
    .max(40)
    .describe("none, some_food_service, management, or prior_owner"),
  facilitySize: z
    .string()
    .max(40)
    .describe(
      "under_1000, 1000_2000, 2000_4000, over_4000, mobile_or_shared, or unknown",
    ),
  serviceModel: z
    .string()
    .max(40)
    .describe("dine_in, catering, delivery, food_truck, ghost_kitchen, or hybrid"),
  targetOpeningDate: z
    .string()
    .max(32)
    .describe("Target opening date as YYYY-MM-DD (planning readiness check only)."),
};

const eventProfitShape = {
  guestCount: z.number().int().min(1).max(5000).describe("Guest count for the event."),
  customerBudgetUsd: z.number().min(0).max(1_000_000).describe("Customer budget in USD."),
  proposedSellingPriceUsd: z
    .number()
    .min(0)
    .max(1_000_000)
    .describe("Proposed selling price in USD."),
  targetMargin: z
    .number()
    .min(0)
    .max(0.95)
    .optional()
    .describe("Target margin as a decimal (default 0.35)."),
  foodCostUsd: z.number().min(0).max(1_000_000).optional().describe("Food cost USD."),
  laborCostUsd: z.number().min(0).max(1_000_000).optional().describe("Labor cost USD."),
  packagingCostUsd: z.number().min(0).max(1_000_000).optional().describe("Packaging cost USD."),
  deliveryCostUsd: z.number().min(0).max(1_000_000).optional().describe("Delivery cost USD."),
  otherCostUsd: z.number().min(0).max(1_000_000).optional().describe("Other cost USD."),
  capacityStatus: z
    .enum(["unknown", "available_for_planning", "constrained", "at_risk"])
    .optional()
    .describe("Planning capacity status only; never confirms operational capacity."),
  notes: z.string().max(500).optional().describe("Optional bounded operator notes."),
  serviceRegion: z
    .enum(["seattle", "bay_area"])
    .optional()
    .describe("iBirdChef catering pilot region."),
};

function textResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

export function createAnsFoodBusinessFitMcpServer() {
  const server = new McpServer({
    name: "ans-food-business-fit",
    version: "1.2.0",
  });

  server.registerTool(
    "analyze_business_fit",
    {
      title: "Analyze Business Fit",
      description:
        "Generate a preliminary ANS Food Business Fit report covering budget alignment, timeline readiness, operational fit, planning risks, missing information, and next steps." +
        PLANNING_GUARDRAIL,
      inputSchema: businessFitShape,
      annotations: READ_ONLY_CLOSED_WORLD,
    },
    async (args) => textResult(runMcpTool("analyze_business_fit", args)),
  );

  server.registerTool(
    "compare_food_service_concepts",
    {
      title: "Compare Food Service Concepts",
      description:
        "Compare 2–3 food-service concepts with the same deterministic planning model. Useful for budget and operational trade-offs; not a market-demand or revenue forecast." +
        PLANNING_GUARDRAIL,
      inputSchema: {
        concepts: z
          .array(
            z.object({
              label: z.string().max(80),
              input: z.object(businessFitShape),
            }),
          )
          .min(2)
          .max(3),
      },
      annotations: READ_ONLY_CLOSED_WORLD,
    },
    async (args) => textResult(runMcpTool("compare_food_service_concepts", args)),
  );

  server.registerTool(
    "build_startup_budget",
    {
      title: "Build Startup Budget",
      description:
        "Build a preliminary startup budget planning range with category breakdown that reconciles to total low/high estimates." +
        PLANNING_GUARDRAIL,
      inputSchema: businessFitShape,
      annotations: READ_ONLY_CLOSED_WORLD,
    },
    async (args) => textResult(runMcpTool("build_startup_budget", args)),
  );

  server.registerTool(
    "generate_opening_checklist",
    {
      title: "Generate Opening Checklist",
      description:
        "Generate generic licensing/checklist and equipment planning categories. All categories require local professional review; opening dates are not guaranteed." +
        PLANNING_GUARDRAIL,
      inputSchema: businessFitShape,
      annotations: READ_ONLY_CLOSED_WORLD,
    },
    async (args) => textResult(runMcpTool("generate_opening_checklist", args)),
  );

  server.registerTool(
    "simulate_event_profit",
    {
      title: "Simulate Event Profit",
      description:
        "Read-only preliminary event-profit simulation from operator-entered guests, budget, proposed price, costs, and capacity-status planning flags for iBirdChef catering pilots (Seattle / Bay Area). Never sends quotes, accepts payments, books events, confirms capacity, or bypasses human approval." +
        PLANNING_GUARDRAIL,
      inputSchema: eventProfitShape,
      annotations: READ_ONLY_CLOSED_WORLD,
    },
    async (args) => textResult(runMcpTool("simulate_event_profit", args)),
  );

  return server;
}
