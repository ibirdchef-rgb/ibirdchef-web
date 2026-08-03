import type {
  BudgetBreakdownCategory,
  BusinessFitInput,
  BusinessType,
  ChecklistCategory,
  FacilitySize,
  MoneyRange,
  TimelineEstimate,
} from "@/lib/business-fit/types";
import { budgetMidThousands, conceptCostMidThousands } from "@/lib/business-fit/scoring";

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

export function estimateStartupBudget(input: BusinessFitInput): {
  total: MoneyRange;
  categories: BudgetBreakdownCategory[];
} {
  const total = baseTotalRange(input);
  const span = total.highUsd - total.lowUsd;
  const mid = (total.lowUsd + total.highUsd) / 2;

  const weights = categoryWeights(input.businessType);
  const categories: BudgetBreakdownCategory[] = Object.entries(weights).map(
    ([category, weight]) => {
      const catMid = mid * weight;
      const half = (span * weight) / 2;
      return {
        category,
        range: moneyRange(catMid - half, catMid + half),
        notes: "Planning estimate only; not a vendor quote.",
      };
    },
  );

  return { total, categories };
}

function categoryWeights(type: BusinessType): Record<string, number> {
  switch (type) {
    case "food_truck":
      return {
        "Vehicle / commissary": 0.34,
        "Kitchen equipment": 0.24,
        "Licenses, insurance, deposits": 0.12,
        "Initial inventory & packaging": 0.1,
        "Working capital reserve": 0.12,
        "Brand, POS, soft costs": 0.08,
      };
    case "ghost_kitchen":
      return {
        "Lease / deposit / build-out": 0.28,
        "Kitchen equipment": 0.3,
        "Licenses, insurance, deposits": 0.1,
        "Initial inventory & packaging": 0.1,
        "Working capital reserve": 0.14,
        "Brand, POS, soft costs": 0.08,
      };
    case "catering":
      return {
        "Production space / deposit": 0.22,
        "Kitchen & transport equipment": 0.28,
        "Licenses, insurance, deposits": 0.12,
        "Initial inventory & packaging": 0.12,
        "Working capital reserve": 0.16,
        "Brand, sales, soft costs": 0.1,
      };
    default:
      return {
        "Lease / deposit / build-out": 0.32,
        "Kitchen & front-of-house equipment": 0.26,
        "Licenses, insurance, deposits": 0.1,
        "Furniture, FF&E, smallwares": 0.1,
        "Initial inventory": 0.08,
        "Working capital reserve": 0.14,
      };
  }
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

  const targetDateFeasible = monthsToTarget >= optimisticMonths;
  const targetDateNote = targetDateFeasible
    ? monthsToTarget >= typical
      ? "Target date is within a typical planning window under this estimate model."
      : "Target date may be achievable only with an accelerated, well-resourced plan."
    : "Target date appears earlier than the optimistic Phase 1 timeline estimate.";

  return {
    optimisticMonths,
    typicalMonths: typical,
    conservativeMonths,
    summary: `Planning estimate: about ${optimisticMonths}–${conservativeMonths} months to opening (typical ~${typical}).`,
    targetDateFeasible,
    targetDateNote,
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

export function buildNextSteps(input: BusinessFitInput): string[] {
  const steps = [
    "Validate concept positioning and menu prototype with target customers (not yet modeled with live demand data).",
    "Obtain local jurisdiction checklists for permits and plan review before signing a lease or vehicle purchase.",
    "Build a capital stack worksheet that separates build-out, equipment, deposits, and 3–6 months working capital.",
    "Define service-model priorities so hybrid channels do not expand scope before unit economics are clear.",
  ];

  if (budgetMidThousands(input.investmentBudget) === null) {
    steps.unshift("Set a firm investment budget range before vendor or site conversations.");
  }

  if (input.ownerExperience === "none") {
    steps.push(
      "Identify an experienced operator mentor or manager candidate before major capital commitments.",
    );
  }

  steps.push(
    "Optional: request an ANS consultation only after you explicitly consent to share contact details (not performed by this Phase 1 tool).",
  );

  return steps;
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
      note: "Deterministic Phase 1 planning model based on user concept inputs.",
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
