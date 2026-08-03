import type {
  BusinessFitInput,
  BusinessType,
  ConfidenceLevel,
  FacilitySize,
  FitBand,
  InvestmentBudget,
  OwnerExperience,
  ScoreBreakdown,
  ScoreContribution,
  ServiceModel,
} from "@/lib/business-fit/types";
import { SCORE_BAND_COPY } from "@/lib/business-fit/types";

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

export function fitBandForScore(score: number): FitBand {
  if (score >= 80) return "strong";
  if (score >= 65) return "promising";
  if (score >= 50) return "moderate";
  return "weak";
}

export function scoreInterpretation(band: FitBand): string {
  return SCORE_BAND_COPY[band].interpretation;
}

function typicalMonthsNeeded(input: BusinessFitInput): number {
  return input.businessType === "restaurant" || input.businessType === "hybrid"
    ? 9
    : input.businessType === "food_truck" || input.businessType === "ghost_kitchen"
      ? 5
      : 7;
}

function monthsUntil(
  targetOpeningDate: string,
  asOfDate: Date,
): number {
  const target = new Date(`${targetOpeningDate}T00:00:00.000Z`);
  if (Number.isNaN(target.getTime())) return Number.NaN;
  return (
    (target.getUTCFullYear() - asOfDate.getUTCFullYear()) * 12 +
    (target.getUTCMonth() - asOfDate.getUTCMonth()) +
    (target.getUTCDate() - asOfDate.getUTCDate()) / 30
  );
}

export function scoreBusinessFit(
  input: BusinessFitInput,
  asOfDate = new Date(),
): {
  fitScore: number;
  fitBand: FitBand;
  fitBandLabel: string;
  fitInterpretation: string;
  confidence: ConfidenceLevel;
  scoreBreakdown: ScoreBreakdown;
  missingInformation: string[];
  majorRisks: string[];
} {
  const missingInformation: string[] = [];
  const contributions: ScoreContribution[] = [];

  contributions.push({
    key: "base",
    label: "Baseline planning score",
    points: 50,
    detail: "Neutral starting point before concept-specific adjustments.",
  });

  const budgetMid = BUDGET_MID_K[input.investmentBudget];
  const conceptMid = CONCEPT_COST_MID_K[input.businessType];
  let budgetPoints = 0;
  let budgetDetail = "";

  if (budgetMid === null) {
    budgetPoints = -10;
    budgetDetail =
      "Investment budget band is unknown, so capital alignment cannot be assessed confidently.";
    missingInformation.push(
      "Available working capital / firm investment budget is not defined beyond “unknown.”",
    );
  } else {
    const ratio = budgetMid / conceptMid;
    if (ratio >= 1.15) {
      budgetPoints = 22;
      budgetDetail = "Stated budget band is above a typical planning midpoint for this concept.";
    } else if (ratio >= 0.9) {
      budgetPoints = 14;
      budgetDetail = "Stated budget band is near a typical planning midpoint for this concept.";
    } else if (ratio >= 0.65) {
      budgetPoints = 4;
      budgetDetail = "Stated budget band is below typical planning midpoint; validation needed.";
    } else if (ratio >= 0.45) {
      budgetPoints = -8;
      budgetDetail = "Stated budget band appears materially below typical planning needs.";
    } else {
      budgetPoints = -20;
      budgetDetail = "Stated budget band is far below a typical planning midpoint for this concept.";
    }
  }
  contributions.push({
    key: "budget_alignment",
    label: "Budget alignment",
    points: budgetPoints,
    detail: budgetDetail,
  });

  const experiencePoints = EXPERIENCE_POINTS[input.ownerExperience];
  contributions.push({
    key: "owner_experience",
    label: "Owner experience",
    points: experiencePoints,
    detail:
      input.ownerExperience === "none"
        ? "Limited food-service experience increases execution risk in this planning model."
        : "Owner experience contribution based on the selected operating background.",
  });
  if (input.ownerExperience === "none") {
    missingInformation.push(
      "Staffing plan and operator mentoring approach are not yet defined for a first-time owner.",
    );
  }

  let facilityServicePoints = 0;
  const facilityOk = FACILITY_FIT[input.businessType].includes(input.facilitySize);
  const facilityNotes: string[] = [];
  if (input.facilitySize === "unknown") {
    facilityServicePoints -= 6;
    facilityNotes.push("Facility size unknown.");
    missingInformation.push(
      "Facility size / seating capacity and existing kitchen infrastructure are not specified.",
    );
  } else if (facilityOk) {
    facilityServicePoints += 8;
    facilityNotes.push("Facility size is a reasonable planning match for the business type.");
  } else {
    facilityServicePoints -= 12;
    facilityNotes.push("Facility size may be a poor match for the business type.");
    missingInformation.push(
      "Facility size may not match the selected business type; seating capacity and kitchen readiness need confirmation.",
    );
  }

  const typeModelMismatch =
    (input.businessType === "food_truck" &&
      input.serviceModel !== "food_truck" &&
      input.serviceModel !== "hybrid") ||
    (input.businessType === "ghost_kitchen" &&
      input.serviceModel !== "ghost_kitchen" &&
      input.serviceModel !== "delivery" &&
      input.serviceModel !== "hybrid");

  if (typeModelMismatch) {
    facilityServicePoints -= 8;
    facilityNotes.push("Business type and service model appear inconsistent.");
    missingInformation.push(
      "Business type and service model appear inconsistent and should be reconciled before site commitments.",
    );
  }
  if (input.serviceModel === "hybrid") {
    facilityNotes.push("Hybrid channels increase alignment complexity.");
    missingInformation.push(
      "Hybrid service-model priorities (dine-in vs delivery vs catering) are not yet ranked.",
    );
  }

  contributions.push({
    key: "facility_service_alignment",
    label: "Facility and service-model alignment",
    points: facilityServicePoints,
    detail: facilityNotes.join(" "),
  });

  let complexityPoints = -MODEL_COMPLEXITY[input.serviceModel];
  let complexityDetail = `Service-model complexity adjustment for ${input.serviceModel.replace(/_/g, " ")}.`;
  if (input.cuisine === "other") {
    complexityPoints -= 3;
    complexityDetail += " Cuisine positioning is still undecided.";
    missingInformation.push(
      "Cuisine / average-check target and menu positioning are not yet defined.",
    );
  }
  contributions.push({
    key: "concept_complexity",
    label: "Concept complexity",
    points: complexityPoints,
    detail: complexityDetail,
  });

  const typicalNeed = typicalMonthsNeeded(input);
  const monthsToTarget = monthsUntil(input.targetOpeningDate, asOfDate);
  let timelinePoints = 0;
  let timelineDetail = "";
  if (Number.isNaN(monthsToTarget) || monthsToTarget < 0) {
    timelinePoints = -6;
    timelineDetail = "Target opening date is in the past or invalid relative to today.";
    missingInformation.push("A realistic future target opening date is still required.");
  } else if (monthsToTarget + 0.5 < typicalNeed * 0.55) {
    timelinePoints = -10;
    timelineDetail =
      "Target opening date is unrealistic versus a typical planning and permitting cycle.";
    missingInformation.push(
      "Opening timeline appears unrealistic; local permit requirements and build-out duration need local review.",
    );
  } else if (monthsToTarget + 0.5 < typicalNeed) {
    timelinePoints = -6;
    timelineDetail =
      "Target opening date is aggressive versus a typical planning and permitting cycle.";
    missingInformation.push(
      "Opening timeline appears aggressive; local permit requirements should be validated early.",
    );
  } else {
    timelinePoints = 6;
    timelineDetail = "Target opening date fits within a typical planning window in this model.";
  }
  contributions.push({
    key: "timeline_feasibility",
    label: "Opening timeline feasibility",
    points: timelinePoints,
    detail: timelineDetail,
  });

  // Phase 1 form does not collect these; list as useful missing planning inputs.
  const recommendedGaps = [
    "Expected monthly rent is not provided (no live rent feed connected).",
    "Available working capital beyond the selected budget band is not itemized.",
    "Seating capacity is not provided.",
    "Existing kitchen infrastructure condition is not provided.",
    "Staffing plan (roles and pre-opening hires) is not provided.",
    "Average check target is not provided.",
    "Expected daily transactions / demand assumptions are not provided.",
    "Local permit requirements for the selected ZIP are not verified (no jurisdiction feed connected).",
    "Competitive-market validation for the ZIP is not provided (no competition feed connected).",
  ];
  for (const gap of recommendedGaps) {
    if (!missingInformation.includes(gap)) {
      missingInformation.push(gap);
    }
  }

  const rawTotal = contributions.reduce((sum, row) => sum + row.points, 0);
  const fitScore = clamp(Math.round(rawTotal), 0, 100);
  const adjustment = fitScore - Math.round(rawTotal);
  if (adjustment !== 0) {
    contributions.push({
      key: "bounds_adjustment",
      label: "Score bounds adjustment",
      points: adjustment,
      detail: "Keeps the displayed score within the 0–100 planning scale.",
    });
  }

  const breakdownTotal = contributions.reduce((sum, row) => sum + row.points, 0);
  const fitBand = fitBandForScore(fitScore);
  const unknownCount = [
    input.investmentBudget === "unknown",
    input.facilitySize === "unknown",
    input.cuisine === "other",
    input.ownerExperience === "none",
  ].filter(Boolean).length;

  let confidence: ConfidenceLevel = "medium";
  if (unknownCount >= 3 || missingInformation.length >= 10) confidence = "low";
  else if (unknownCount === 0 && missingInformation.length <= 9) confidence = "medium";
  if (unknownCount === 0 && fitScore >= 80 && monthsToTarget >= typicalNeed) {
    confidence = "high";
  }

  return {
    fitScore,
    fitBand,
    fitBandLabel: SCORE_BAND_COPY[fitBand].rangeLabel,
    fitInterpretation: SCORE_BAND_COPY[fitBand].interpretation,
    confidence,
    scoreBreakdown: {
      contributions,
      total: breakdownTotal,
    },
    missingInformation,
    majorRisks: buildMajorRisks(input, fitScore, monthsToTarget, typicalNeed),
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

  if (!Number.isNaN(monthsToTarget) && monthsToTarget >= 0 && monthsToTarget + 0.5 < typicalNeed) {
    risks.push("Opening target may compress permitting, construction, and hiring work.");
  }

  if (input.serviceModel === "hybrid") {
    risks.push("Multi-channel launch scope can dilute focus and inflate pre-opening spend.");
  }

  if (fitScore < 50) {
    risks.push(
      "Overall concept-capital-timeline alignment is a high-risk preliminary fit under this Phase 1 model.",
    );
  }

  risks.push(
    "Local demand, rent, competition, and licensing requirements are not verified in Phase 1.",
  );
  risks.push(
    "This score is a planning estimate only and does not guarantee business success, demand, or profit.",
  );

  return risks;
}

export function conceptCostMidThousands(type: BusinessType): number {
  return CONCEPT_COST_MID_K[type];
}

export function budgetMidThousands(budget: InvestmentBudget): number | null {
  return BUDGET_MID_K[budget];
}
