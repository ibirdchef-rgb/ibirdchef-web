import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runMcpTool } from "../../../mcp/tools";

const PLANNING_GUARDRAIL =
  " Returns preliminary planning estimates only. Not legal, tax, accounting, investment, licensing, financing, or guaranteed financial advice. No live market, competition, revenue, or ROI data. Local professional verification is required before decisions.";

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
    version: "1.1.0",
  });

  server.registerTool(
    "analyze_business_fit",
    {
      title: "Analyze Business Fit",
      description:
        "Generate a preliminary ANS Food Business Fit report covering budget alignment, timeline readiness, operational fit, planning risks, missing information, and next steps." +
        PLANNING_GUARDRAIL,
      inputSchema: businessFitShape,
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
    },
    async (args) => textResult(runMcpTool("generate_opening_checklist", args)),
  );

  return server;
}
