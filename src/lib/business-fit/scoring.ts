import type {
  BusinessFitInput,
  BusinessType,
  ConfidenceLevel,
  FacilitySize,
  InvestmentBudget,
  OwnerExperience,
  ServiceModel,
} from "@/lib/business-fit/types";

/** Midpoint of modeled total startup need by business type (USD thousands). */
const CONCEPT_COST_MID_K: Record<BusinessType, number> = {
  cafe: 180,
  bakery: 220,
  food_truck: 120,
  ghost_kitchen: 160,
  catering: 140,
  restaurant: 350,
  hybrid: 400,
};

const BUDGET_MID_K: Record<InvestmentBudget, number | null> = {
  under_50k: 35,
  "50_150k": 100,
  "150_300k": 225,
  "300_500k": 400,
  over_500k: 650,
  unknown: null,
};

const EXPERIENCE_POINTS: Record<OwnerExperience, number> = {
  none: 0,
  some_food_service: 8,
  management: 14,
  prior_owner: 18,
};

const FACILITY_FIT: Record<BusinessType, FacilitySize[]> = {
  food_truck: ["mobile_or_shared", "unknown"],
  ghost_kitchen: ["under_1000", "1000_2000", "mobile_or_shared", "unknown"],
  cafe: ["under_1000", "1000_2000", "unknown"],
  bakery: ["under_1000", "1000_2000", "2000_4000", "unknown"],
  catering: ["under_1000", "1000_2000", "2000_4000", "mobile_or_shared", "unknown"],
  restaurant: ["1000_2000", "2000_4000", "over_4000", "unknown"],
  hybrid: ["1000_2000", "2000_4000", "over_4000", "unknown"],
};

const MODEL_COMPLEXITY: Record<ServiceModel, number> = {
  dine_in: 4,
  catering: 3,
  delivery: 3,
  food_truck: 2,
  ghost_kitchen: 2,
  hybrid: 8,
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function fitBandForScore(
  score: number,
): "weak" | "moderate" | "promising" | "strong" {
  if (score >= 80) return "strong";
  if (score >= 65) return "promising";
  if (score >= 45) return "moderate";
  return "weak";
}

export function scoreBusinessFit(input: BusinessFitInput, asOfDate = new Date()): {
  fitScore: number;
  fitBand: "weak" | "moderate" | "promising" | "strong";
  confidence: ConfidenceLevel;
  missingInformation: string[];
  majorRisks: string[];
} {
  const missingInformation: string[] = [];
  let score = 52;

  const budgetMid = BUDGET_MID_K[input.investmentBudget];
  const conceptMid = CONCEPT_COST_MID_K[input.businessType];

  if (budgetMid === null) {
    missingInformation.push(
      "Investment budget is unknown; capital adequacy cannot be assessed with confidence.",
    );
    score -= 10;
  } else {
    const ratio = budgetMid / conceptMid;
    if (ratio >= 1.15) score += 22;
    else if (ratio >= 0.9) score += 14;
    else if (ratio >= 0.65) score += 4;
    else if (ratio >= 0.45) score -= 8;
    else score -= 20;
  }

  score += EXPERIENCE_POINTS[input.ownerExperience];
  if (input.ownerExperience === "none") {
    missingInformation.push(
      "Owner experience is limited; operator mentoring and staffing plans need definition.",
    );
  }

  const facilityOk = FACILITY_FIT[input.businessType].includes(input.facilitySize);
  if (input.facilitySize === "unknown") {
    missingInformation.push(
      "Facility size is unknown; rent, build-out, and equipment ranges remain wide.",
    );
    score -= 6;
  } else if (facilityOk) {
    score += 8;
  } else {
    score -= 12;
    missingInformation.push(
      "Selected facility size may be a poor match for the chosen business type.",
    );
  }

  score -= MODEL_COMPLEXITY[input.serviceModel];
  if (input.serviceModel === "hybrid") {
    missingInformation.push(
      "Hybrid service models require clearer channel priorities before capital is committed.",
    );
  }

  if (
    (input.businessType === "food_truck" && input.serviceModel !== "food_truck" && input.serviceModel !== "hybrid") ||
    (input.businessType === "ghost_kitchen" &&
      input.serviceModel !== "ghost_kitchen" &&
      input.serviceModel !== "delivery" &&
      input.serviceModel !== "hybrid")
  ) {
    score -= 8;
    missingInformation.push(
      "Business type and service model appear inconsistent and should be reconciled.",
    );
  }

  const target = new Date(`${input.targetOpeningDate}T00:00:00.000Z`);
  const monthsToTarget =
    (target.getUTCFullYear() - asOfDate.getUTCFullYear()) * 12 +
    (target.getUTCMonth() - asOfDate.getUTCMonth());

  const typicalNeed =
    input.businessType === "restaurant" || input.businessType === "hybrid"
      ? 9
      : input.businessType === "food_truck" || input.businessType === "ghost_kitchen"
        ? 5
        : 7;

  if (Number.isNaN(target.getTime()) || monthsToTarget < 0) {
    score -= 6;
    missingInformation.push("Target opening date is in the past or invalid relative to today.");
  } else if (monthsToTarget + 0.5 < typicalNeed) {
    score -= 10;
    missingInformation.push(
      "Target opening date appears aggressive versus a typical planning and permitting cycle.",
    );
  } else {
    score += 6;
  }

  if (input.cuisine === "other") {
    missingInformation.push(
      "Cuisine is unspecified; concept positioning and menu engineering still need definition.",
    );
    score -= 3;
  }

  const fitScore = clamp(Math.round(score), 0, 100);
  const unknownCount = [
    input.investmentBudget === "unknown",
    input.facilitySize === "unknown",
    input.cuisine === "other",
    input.ownerExperience === "none",
  ].filter(Boolean).length;

  let confidence: ConfidenceLevel = "medium";
  if (unknownCount >= 3 || missingInformation.length >= 5) confidence = "low";
  else if (unknownCount === 0 && missingInformation.length <= 1) confidence = "high";

  const majorRisks = buildMajorRisks(input, fitScore, monthsToTarget, typicalNeed);

  return {
    fitScore,
    fitBand: fitBandForScore(fitScore),
    confidence,
    missingInformation,
    majorRisks,
  };
}

function buildMajorRisks(
  input: BusinessFitInput,
  fitScore: number,
  monthsToTarget: number,
  typicalNeed: number,
): string[] {
  const risks: string[] = [];

  if (BUDGET_MID_K[input.investmentBudget] !== null) {
    const ratio =
      (BUDGET_MID_K[input.investmentBudget] as number) /
      CONCEPT_COST_MID_K[input.businessType];
    if (ratio < 0.65) {
      risks.push(
        "Available capital may be below a typical startup range for this concept class (planning estimate).",
      );
    }
  } else {
    risks.push("Capital plan is undefined; underfunding risk cannot be ruled out.");
  }

  if (input.ownerExperience === "none") {
    risks.push("Limited food-service operating experience increases execution and staffing risk.");
  }

  if (monthsToTarget >= 0 && monthsToTarget + 0.5 < typicalNeed) {
    risks.push("Opening target may compress permitting, construction, and hiring work.");
  }

  if (input.serviceModel === "hybrid") {
    risks.push("Multi-channel launch scope can dilute focus and inflate pre-opening spend.");
  }

  if (fitScore < 45) {
    risks.push("Overall concept-capital-timeline alignment is weak under this Phase 1 model.");
  }

  risks.push(
    "Local demand, rent, competition, and licensing requirements are not verified in Phase 1.",
  );

  return risks;
}

/** Exposed for tests and budget alignment checks. */
export function conceptCostMidThousands(type: BusinessType): number {
  return CONCEPT_COST_MID_K[type];
}

export function budgetMidThousands(budget: InvestmentBudget): number | null {
  return BUDGET_MID_K[budget];
}
