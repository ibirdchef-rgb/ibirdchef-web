import type {
  BudgetBreakdownCategory,
  BusinessFitInput,
  BusinessType,
  ChecklistCategory,
  FacilitySize,
  MoneyRange,
  NextStepGroups,
  TargetDateStatus,
  TimelineEstimate,
  TimelinePhase,
} from "@/lib/business-fit/types";
import { budgetMidThousands, conceptCostMidThousands } from "@/lib/business-fit/scoring";

export const BUDGET_CATEGORY_NAMES = [
  "Lease deposit and initial occupancy",
  "Construction and improvements",
  "Kitchen equipment",
  "Furniture, fixtures, and technology",
  "Permits and professional fees",
  "Opening inventory",
  "Pre-opening payroll and training",
  "Marketing and signage",
  "Working-capital reserve",
  "Contingency",
] as const;

function moneyRange(lowUsd: number, highUsd: number): MoneyRange {
  const low = Math.round(lowUsd);
  const high = Math.round(highUsd);
  return {
    lowUsd: low,
    highUsd: high,
    currency: "USD",
    label: `$${low.toLocaleString("en-US")} – $${high.toLocaleString("en-US")} (planning estimate)`,
  };
}

const FACILITY_MULT: Record<FacilitySize, number> = {
  under_1000: 0.85,
  "1000_2000": 1,
  "2000_4000": 1.25,
  over_4000: 1.55,
  mobile_or_shared: 0.7,
  unknown: 1.15,
};

function baseTotalRange(input: BusinessFitInput): MoneyRange {
  const mid = conceptCostMidThousands(input.businessType) * 1000;
  const mult = FACILITY_MULT[input.facilitySize];
  const serviceMult =
    input.serviceModel === "hybrid" ? 1.18 : input.serviceModel === "dine_in" ? 1.08 : 1;
  const center = mid * mult * serviceMult;
  return moneyRange(center * 0.78, center * 1.28);
}

function categoryWeights(type: BusinessType): number[] {
  // Order matches BUDGET_CATEGORY_NAMES; sums to 1.
  switch (type) {
    case "food_truck":
      return [0.18, 0.08, 0.24, 0.08, 0.08, 0.08, 0.07, 0.06, 0.08, 0.05];
    case "ghost_kitchen":
      return [0.16, 0.14, 0.22, 0.08, 0.08, 0.08, 0.07, 0.05, 0.07, 0.05];
    case "catering":
      return [0.14, 0.12, 0.2, 0.1, 0.08, 0.09, 0.08, 0.06, 0.08, 0.05];
    default:
      return [0.14, 0.18, 0.16, 0.1, 0.07, 0.07, 0.08, 0.05, 0.1, 0.05];
  }
}

function allocateByWeights(total: number, weights: number[]): number[] {
  const raw = weights.map((weight) => total * weight);
  const rounded = raw.map((value) => Math.floor(value));
  const remainder = total - rounded.reduce((sum, value) => sum + value, 0);
  // Distribute remainder to largest fractional parts for stable reconciliation.
  const order = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < remainder; i += 1) {
    rounded[order[i % order.length].index] += 1;
  }
  return rounded;
}

export function estimateStartupBudget(input: BusinessFitInput): {
  total: MoneyRange;
  categories: BudgetBreakdownCategory[];
} {
  const total = baseTotalRange(input);
  const weights = categoryWeights(input.businessType);
  const lows = allocateByWeights(total.lowUsd, weights);
  const highs = allocateByWeights(total.highUsd, weights);

  const categories: BudgetBreakdownCategory[] = BUDGET_CATEGORY_NAMES.map((category, index) => ({
    category,
    range: moneyRange(lows[index], highs[index]),
    notes: "Planning estimate only; not a vendor quote or bid.",
  }));

  return { total, categories };
}

function phasePlan(typicalMonths: number, type: BusinessType): TimelinePhase[] {
  const weights =
    type === "food_truck" || type === "ghost_kitchen"
      ? [0.15, 0.15, 0.2, 0.25, 0.15, 0.1]
      : [0.12, 0.18, 0.22, 0.25, 0.13, 0.1];

  const names = [
    "Concept validation",
    "Site search and lease review",
    "Design and permitting",
    "Construction and equipment",
    "Hiring and training",
    "Inspection and opening",
  ];
  const details = [
    "Clarify menu, service model, and capital assumptions with customer and advisor feedback.",
    "Compare locations or commissary options; review lease terms with qualified local counsel.",
    "Complete plan review packages and jurisdiction-specific permit pathways.",
    "Execute build-out and procure kitchen / FFE packages against approved plans.",
    "Hire key roles, train service standards, and finalize opening inventory.",
    "Complete inspections, soft opening readiness, and launch checklist close-out.",
  ];

  const months = allocateByWeights(typicalMonths, weights).map((value) => Math.max(1, value));
  // Re-normalize if min floors increased total.
  let overflow = months.reduce((sum, value) => sum + value, 0) - typicalMonths;
  while (overflow > 0) {
    const idx = months.indexOf(Math.max(...months));
    if (months[idx] <= 1) break;
    months[idx] -= 1;
    overflow -= 1;
  }

  return names.map((name, index) => ({
    name,
    approximateMonths: months[index],
    detail: details[index],
  }));
}

export function estimateOpeningTimeline(
  input: BusinessFitInput,
  asOfDate = new Date(),
): TimelineEstimate {
  let typical =
    input.businessType === "restaurant" || input.businessType === "hybrid"
      ? 9
      : input.businessType === "food_truck" || input.businessType === "ghost_kitchen"
        ? 5
        : 7;

  if (input.ownerExperience === "none") typical += 1;
  if (input.ownerExperience === "prior_owner") typical -= 1;
  if (input.serviceModel === "hybrid") typical += 1;
  if (input.facilitySize === "over_4000") typical += 1;
  if (input.facilitySize === "mobile_or_shared") typical -= 1;

  typical = Math.max(3, typical);
  const optimisticMonths = Math.max(2, typical - 2);
  const conservativeMonths = typical + 3;

  const target = new Date(`${input.targetOpeningDate}T00:00:00.000Z`);
  const monthsToTarget =
    (target.getUTCFullYear() - asOfDate.getUTCFullYear()) * 12 +
    (target.getUTCMonth() - asOfDate.getUTCMonth()) +
    (target.getUTCDate() - asOfDate.getUTCDate()) / 30;

  let targetDateStatus: TargetDateStatus = "realistic";
  let targetDateNote =
    "Target date is within a typical planning window under this estimate model.";
  let targetDateFeasible = true;

  if (Number.isNaN(target.getTime()) || monthsToTarget < 0) {
    targetDateStatus = "past";
    targetDateFeasible = false;
    targetDateNote = "Target date is in the past or invalid relative to today.";
  } else if (monthsToTarget + 0.5 < optimisticMonths * 0.75) {
    targetDateStatus = "unrealistic";
    targetDateFeasible = false;
    targetDateNote =
      "Target date appears unrealistic versus even an optimistic Phase 1 timeline estimate.";
  } else if (monthsToTarget + 0.5 < typical) {
    targetDateStatus = "aggressive";
    targetDateFeasible = monthsToTarget >= optimisticMonths;
    targetDateNote =
      "Target date appears aggressive and may require an accelerated, well-resourced plan.";
  } else if (monthsToTarget >= typical) {
    targetDateStatus = "realistic";
    targetDateFeasible = true;
    targetDateNote = "Target date is within a typical planning window under this estimate model.";
  }

  const phases = phasePlan(typical, input.businessType);

  return {
    optimisticMonths,
    typicalMonths: typical,
    conservativeMonths,
    summary: `Planning estimate: about ${optimisticMonths}–${conservativeMonths} months to opening (typical ~${typical}).`,
    targetDateFeasible,
    targetDateStatus,
    targetDateNote,
    phases,
  };
}

export function buildLicensingChecklist(input: BusinessFitInput): ChecklistCategory[] {
  const base: ChecklistCategory[] = [
    {
      category: "Business formation & tax",
      items: [
        "Entity formation and EIN",
        "Local business license",
        "Sales tax / seller's permit registration",
      ],
      requiresLocalReview: true,
    },
    {
      category: "Food safety & health",
      items: [
        "Health department plan review (if applicable)",
        "Food facility permit",
        "Food handler / manager certification",
      ],
      requiresLocalReview: true,
    },
    {
      category: "Insurance & risk",
      items: [
        "General liability",
        "Property / equipment coverage",
        "Workers' compensation (when hiring)",
      ],
      requiresLocalReview: true,
    },
  ];

  if (input.businessType === "food_truck" || input.serviceModel === "food_truck") {
    base.push({
      category: "Mobile food operations",
      items: [
        "Mobile food facility permit",
        "Commissary agreement",
        "Parking / route / event permissions",
      ],
      requiresLocalReview: true,
    });
  }

  if (
    input.serviceModel === "dine_in" ||
    input.businessType === "restaurant" ||
    input.businessType === "cafe"
  ) {
    base.push({
      category: "Occupancy & build-out",
      items: [
        "Certificate of occupancy path",
        "Building / fire inspections",
        "Accessibility compliance review",
      ],
      requiresLocalReview: true,
    });
  }

  if (input.serviceModel === "delivery" || input.serviceModel === "hybrid") {
    base.push({
      category: "Delivery operations",
      items: [
        "Packaging and allergen labeling plan",
        "Third-party delivery onboarding checklist",
        "Driver / courier insurance review if self-delivery",
      ],
      requiresLocalReview: true,
    });
  }

  return base;
}

export function buildEquipmentCategories(input: BusinessFitInput): string[] {
  const shared = [
    "Refrigeration and dry storage",
    "Cooking line / preparation equipment",
    "Warewashing and sanitation",
    "Smallwares and safety equipment",
    "POS and order management",
  ];

  if (input.businessType === "food_truck") {
    return [
      "Mobile kitchen vehicle systems",
      "Generator / power management",
      ...shared,
      "Serving window setup",
    ];
  }

  if (input.businessType === "bakery") {
    return [
      "Ovens and proofing",
      "Mixers and bakery production",
      ...shared,
      "Display cases (if retail)",
    ];
  }

  if (input.serviceModel === "dine_in" || input.businessType === "restaurant") {
    return [
      ...shared,
      "Dining furniture and front-of-house",
      "HVAC / hood / fire suppression coordination",
    ];
  }

  return shared;
}

export function buildNextStepGroups(input: BusinessFitInput): NextStepGroups {
  const doNow = [
    "Write a one-page concept brief covering cuisine, service model, and target guest.",
    "List assumptions behind the selected investment budget band and opening date.",
  ];
  if (budgetMidThousands(input.investmentBudget) === null) {
    doNow.unshift("Set a firm investment budget range before vendor or site conversations.");
  }
  if (input.cuisine === "other") {
    doNow.push("Choose a primary cuisine positioning before expanding into multi-cuisine scope.");
  }

  const validateBeforeLease = [
    "Validate concept positioning with target customers (live demand data is not connected in Phase 1).",
    "Obtain local jurisdiction checklists for permits and plan review before signing a lease or vehicle purchase.",
    "Confirm expected monthly rent, deposit structure, and exclusive-use terms with qualified local review.",
    "Pressure-test working capital for at least 3–6 months of operating burn (planning estimate).",
  ];
  if (input.serviceModel === "hybrid") {
    validateBeforeLease.push(
      "Rank service channels so hybrid launch scope does not expand before unit economics are clear.",
    );
  }
  if (
    input.facilitySize === "unknown" ||
    !["under_1000", "1000_2000", "2000_4000", "over_4000", "mobile_or_shared"].includes(
      input.facilitySize,
    )
  ) {
    validateBeforeLease.push("Confirm facility size, seating capacity, and kitchen infrastructure condition.");
  }

  const completeBeforeOpening = [
    "Finalize staffing plan, training schedule, and opening inventory levels.",
    "Complete inspections, insurance binders, and soft-opening readiness checks.",
    "Set average-check and daily-transaction targets for the first 90 days (planning targets, not forecasts).",
    "Optional: request an ANS consultation only after explicit consent to share contact details (not performed by this Phase 1 tool).",
  ];
  if (input.ownerExperience === "none") {
    completeBeforeOpening.unshift(
      "Identify an experienced operator mentor or manager candidate before major capital commitments.",
    );
  }

  return { doNow, validateBeforeLease, completeBeforeOpening };
}

export function buildNextSteps(input: BusinessFitInput): string[] {
  const groups = buildNextStepGroups(input);
  return [...groups.doNow, ...groups.validateBeforeLease, ...groups.completeBeforeOpening];
}

export function buildInputSummary(input: BusinessFitInput): string[] {
  return [
    `ZIP: ${input.zipCode}`,
    `Business type: ${input.businessType}`,
    `Cuisine: ${input.cuisine}`,
    `Investment budget: ${input.investmentBudget}`,
    `Owner experience: ${input.ownerExperience}`,
    `Facility size: ${input.facilitySize}`,
    `Service model: ${input.serviceModel}`,
    `Target opening date: ${input.targetOpeningDate}`,
  ];
}

export function buildDataSources(generatedAt: string) {
  return [
    {
      domain: "demographics_demand",
      kind: "not_connected" as const,
      note: "No verified ZIP-level demographic or demand provider connected.",
      asOf: null,
    },
    {
      domain: "commercial_rent",
      kind: "not_connected" as const,
      note: "No live commercial real-estate feed connected.",
      asOf: null,
    },
    {
      domain: "competition_delivery",
      kind: "not_connected" as const,
      note: "No competition or delivery-market data provider connected.",
      asOf: null,
    },
    {
      domain: "permits_licensing",
      kind: "not_connected" as const,
      note: "No jurisdiction-owned permit source connected; checklist is generic.",
      asOf: null,
    },
    {
      domain: "phase1_estimator",
      kind: "planning_estimate" as const,
      note: "Deterministic Phase 1.1 planning model based on user concept inputs.",
      asOf: generatedAt,
    },
    {
      domain: "user_inputs",
      kind: "user_provided" as const,
      note: "ZIP, concept, cuisine, budget band, experience, facility, service model, target date.",
      asOf: generatedAt,
    },
  ];
}
