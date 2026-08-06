import { z } from "zod";

export const CAPACITY_STATUSES = [
  "unknown",
  "available_for_planning",
  "constrained",
  "at_risk",
] as const;

export type CapacityStatus = (typeof CAPACITY_STATUSES)[number];

export const EVENT_PROFIT_DECISIONS = [
  "Profitable",
  "Profitable with adjustments",
  "Below target margin",
  "Budget mismatch",
  "Capacity risk",
  "Missing cost information",
  "Manual review required",
] as const;

export type EventProfitDecision = (typeof EVENT_PROFIT_DECISIONS)[number];

const MONEY_MAX = 1_000_000;
const GUEST_MAX = 5_000;
const MARGIN_MAX = 0.95;

const FORBIDDEN_ACTION_RE =
  /\b(send\s+quote|accept\s+payment|book\s+event|confirm\s+(capacity|booking)|override\s+cost|bypass\s+(human\s+)?approval|wire\s+transfer|charge\s+card)\b/i;

function requiredMoney(label: string) {
  return z
    .number()
    .finite()
    .min(0, `${label} cannot be negative`)
    .max(MONEY_MAX, `${label} exceeds allowed maximum`);
}

function optionalMoney(label: string) {
  return requiredMoney(label).optional();
}

export const simulateEventProfitInputSchema = z
  .object({
    guestCount: z
      .number()
      .int("guestCount must be an integer")
      .min(1, "guestCount must be at least 1")
      .max(GUEST_MAX, "guestCount exceeds allowed maximum"),
    customerBudgetUsd: requiredMoney("customerBudgetUsd"),
    proposedSellingPriceUsd: requiredMoney("proposedSellingPriceUsd"),
    targetMargin: z
      .number()
      .finite()
      .min(0, "targetMargin cannot be negative")
      .max(MARGIN_MAX, "targetMargin exceeds allowed maximum")
      .default(0.35),
    foodCostUsd: optionalMoney("foodCostUsd"),
    laborCostUsd: optionalMoney("laborCostUsd"),
    packagingCostUsd: optionalMoney("packagingCostUsd"),
    deliveryCostUsd: optionalMoney("deliveryCostUsd"),
    otherCostUsd: optionalMoney("otherCostUsd"),
    capacityStatus: z.enum(CAPACITY_STATUSES).default("unknown"),
    notes: z
      .string()
      .trim()
      .max(500, "notes exceeds 500 characters")
      .optional()
      .refine((value) => !value || !FORBIDDEN_ACTION_RE.test(value), {
        message:
          "notes cannot request quote sending, payments, booking, capacity confirmation, cost override, or approval bypass",
      }),
    serviceRegion: z
      .enum(["seattle", "bay_area"])
      .default("seattle")
      .describe("Pilot regions only: Seattle or Bay Area iBirdChef catering."),
  })
  .strict()
  .superRefine((value, ctx) => {
    const blob = JSON.stringify(value);
    if (FORBIDDEN_ACTION_RE.test(blob)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Input cannot request quote sending, payments, booking, capacity confirmation, cost override, or approval bypass",
      });
    }
  });

export type SimulateEventProfitInput = z.output<typeof simulateEventProfitInputSchema>;

export type SimulateEventProfitResult = {
  planningEstimateOnly: true;
  humanApprovalRequired: true;
  commercialActionsBlocked: true;
  pilot: {
    brand: "iBirdChef";
    regions: ["seattle", "bay_area"];
    serviceRegion: "seattle" | "bay_area";
  };
  input: SimulateEventProfitInput;
  totalKnownCostUsd: number | null;
  recommendedSellingPriceUsd: number | null;
  expectedProfitUsd: number | null;
  expectedMargin: number | null;
  expectedMarginPercent: number | null;
  budgetVarianceUsd: number;
  missingCostWarnings: string[];
  capacityStatus: CapacityStatus;
  decisionState: EventProfitDecision;
  decisionReasons: string[];
  disclaimers: string[];
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundRatio(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function parseSimulateEventProfitInput(raw: unknown) {
  const parsed = simulateEventProfitInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: {
        code: "validation_error" as const,
        message: "Invalid simulate_event_profit input",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join(".") || "(root)",
          message: issue.message,
        })),
      },
    };
  }
  return { ok: true as const, data: parsed.data };
}

export function simulateEventProfit(
  input: SimulateEventProfitInput,
): SimulateEventProfitResult {
  const missingCostWarnings: string[] = [];
  if (input.foodCostUsd === undefined) {
    missingCostWarnings.push("Food cost is missing and is required for a profit conclusion.");
  }
  if (input.laborCostUsd === undefined) {
    missingCostWarnings.push("Labor cost is missing and is required for a profit conclusion.");
  }
  if (input.packagingCostUsd === undefined) {
    missingCostWarnings.push("Packaging cost was not provided.");
  }
  if (input.deliveryCostUsd === undefined) {
    missingCostWarnings.push("Delivery cost was not provided.");
  }

  const requiredCostsPresent =
    input.foodCostUsd !== undefined && input.laborCostUsd !== undefined;

  const knownParts = [
    input.foodCostUsd,
    input.laborCostUsd,
    input.packagingCostUsd,
    input.deliveryCostUsd,
    input.otherCostUsd,
  ].filter((value): value is number => typeof value === "number");

  const totalKnownCostUsd = requiredCostsPresent
    ? roundMoney(knownParts.reduce((sum, value) => sum + value, 0))
    : null;

  const budgetVarianceUsd = roundMoney(
    input.proposedSellingPriceUsd - input.customerBudgetUsd,
  );

  let expectedProfitUsd: number | null = null;
  let expectedMargin: number | null = null;
  let expectedMarginPercent: number | null = null;
  let recommendedSellingPriceUsd: number | null = null;

  if (totalKnownCostUsd !== null) {
    expectedProfitUsd = roundMoney(input.proposedSellingPriceUsd - totalKnownCostUsd);
    expectedMargin =
      input.proposedSellingPriceUsd > 0
        ? roundRatio(expectedProfitUsd / input.proposedSellingPriceUsd)
        : null;
    expectedMarginPercent =
      expectedMargin === null ? null : roundMoney(expectedMargin * 100);
    recommendedSellingPriceUsd =
      input.targetMargin < 1
        ? roundMoney(totalKnownCostUsd / (1 - input.targetMargin))
        : null;
  }

  const decisionReasons: string[] = [];
  let decisionState: EventProfitDecision = "Manual review required";

  if (!requiredCostsPresent) {
    decisionState = "Missing cost information";
    decisionReasons.push(
      "Required food and labor costs are incomplete, so no final profit conclusion is returned.",
    );
  } else if (input.capacityStatus === "at_risk") {
    decisionState = "Capacity risk";
    decisionReasons.push(
      "Capacity status is at_risk. This tool does not confirm operational capacity; human review is required.",
    );
  } else if (input.proposedSellingPriceUsd > input.customerBudgetUsd) {
    decisionState = "Budget mismatch";
    decisionReasons.push(
      `Proposed selling price exceeds customer budget by $${budgetVarianceUsd.toFixed(2)}.`,
    );
  } else if (
    expectedMargin !== null &&
    expectedMargin + 1e-9 < input.targetMargin
  ) {
    decisionState = "Below target margin";
    decisionReasons.push(
      `Expected margin ${(expectedMargin * 100).toFixed(2)}% is below target ${(input.targetMargin * 100).toFixed(2)}%.`,
    );
  } else if (
    expectedProfitUsd !== null &&
    expectedProfitUsd > 0 &&
    (input.capacityStatus === "constrained" ||
      missingCostWarnings.some((warning) => warning.includes("not provided")))
  ) {
    // Break-even (profit === 0) and losses are never "profitable*".
    decisionState = "Profitable with adjustments";
    decisionReasons.push(
      "Economics may work, but optional costs or capacity constraints still need human adjustments.",
    );
  } else if (expectedProfitUsd !== null && expectedProfitUsd > 0) {
    decisionState = "Profitable";
    decisionReasons.push(
      "Known costs and proposed price meet the preliminary profitable threshold for planning review.",
    );
  } else {
    decisionState = "Manual review required";
    decisionReasons.push(
      expectedProfitUsd !== null && expectedProfitUsd === 0
        ? "Expected profit is exactly break-even; this is not classified as profitable and requires human review."
        : "Preliminary economics are inconclusive; human approval is required before any commercial action.",
    );
  }

  return {
    planningEstimateOnly: true,
    humanApprovalRequired: true,
    commercialActionsBlocked: true,
    pilot: {
      brand: "iBirdChef",
      regions: ["seattle", "bay_area"],
      serviceRegion: input.serviceRegion,
    },
    input,
    totalKnownCostUsd,
    recommendedSellingPriceUsd,
    expectedProfitUsd,
    expectedMargin,
    expectedMarginPercent,
    budgetVarianceUsd,
    missingCostWarnings,
    capacityStatus: input.capacityStatus,
    decisionState,
    decisionReasons,
    disclaimers: [
      "Preliminary planning estimate only for iBirdChef catering pilot regions (Seattle and Bay Area).",
      "Does not send quotes, accept payments, book events, confirm capacity, or bypass human approval.",
      "Not a guarantee of profit, margin, or operational feasibility.",
      "Human approval is required before any commercial action.",
    ],
  };
}
