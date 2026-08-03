import {
  buildBusinessFitReport,
  buildOpeningChecklistResult,
  buildStartupBudgetResult,
  compareFoodServiceConcepts,
  parseBusinessFitInput,
  parseCompareConceptsInput,
} from "../src/lib/business-fit/index";

export type McpToolName =
  | "analyze_business_fit"
  | "compare_food_service_concepts"
  | "build_startup_budget"
  | "generate_opening_checklist";

export const MCP_TOOL_NAMES: McpToolName[] = [
  "analyze_business_fit",
  "compare_food_service_concepts",
  "build_startup_budget",
  "generate_opening_checklist",
];

export function runMcpTool(name: McpToolName, args: unknown) {
  switch (name) {
    case "analyze_business_fit": {
      const parsed = parseBusinessFitInput(args);
      if (!parsed.ok) {
        return { ok: false as const, error: parsed.error };
      }
      return {
        ok: true as const,
        result: buildBusinessFitReport(parsed.data),
      };
    }
    case "build_startup_budget": {
      const parsed = parseBusinessFitInput(args);
      if (!parsed.ok) {
        return { ok: false as const, error: parsed.error };
      }
      return {
        ok: true as const,
        result: buildStartupBudgetResult(parsed.data),
      };
    }
    case "generate_opening_checklist": {
      const parsed = parseBusinessFitInput(args);
      if (!parsed.ok) {
        return { ok: false as const, error: parsed.error };
      }
      return {
        ok: true as const,
        result: buildOpeningChecklistResult(parsed.data),
      };
    }
    case "compare_food_service_concepts": {
      const parsed = parseCompareConceptsInput(args);
      if (!parsed.ok) {
        return { ok: false as const, error: parsed.error };
      }
      return {
        ok: true as const,
        result: compareFoodServiceConcepts(parsed.data.concepts),
      };
    }
    default: {
      const _exhaustive: never = name;
      return {
        ok: false as const,
        error: {
          code: "unknown_tool",
          message: `Unknown tool: ${_exhaustive}`,
        },
      };
    }
  }
}
