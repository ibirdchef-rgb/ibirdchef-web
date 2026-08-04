export const REPORT_VERSION = "1.1.0" as const;
export const ESTIMATOR_VERSION = "phase1-deterministic-v1.1" as const;

export const BUSINESS_TYPES = [
  "restaurant",
  "cafe",
  "food_truck",
  "ghost_kitchen",
  "catering",
  "bakery",
  "hybrid",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const CUISINES = [
  "american",
  "south_asian",
  "east_asian",
  "latin",
  "mediterranean",
  "bakery_dessert",
  "multi_cuisine",
  "other",
] as const;

export type Cuisine = (typeof CUISINES)[number];

export const SERVICE_MODELS = [
  "dine_in",
  "catering",
  "delivery",
  "food_truck",
  "ghost_kitchen",
  "hybrid",
] as const;

export type ServiceModel = (typeof SERVICE_MODELS)[number];

export const OWNER_EXPERIENCE = [
  "none",
  "some_food_service",
  "management",
  "prior_owner",
] as const;

export type OwnerExperience = (typeof OWNER_EXPERIENCE)[number];

export const FACILITY_SIZES = [
  "under_1000",
  "1000_2000",
  "2000_4000",
  "over_4000",
  "mobile_or_shared",
  "unknown",
] as const;

export type FacilitySize = (typeof FACILITY_SIZES)[number];

export const INVESTMENT_BUDGETS = [
  "under_50k",
  "50_150k",
  "150_300k",
  "300_500k",
  "over_500k",
  "unknown",
] as const;

export type InvestmentBudget = (typeof INVESTMENT_BUDGETS)[number];

export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export type ConfidenceLevel = (typeof CONFIDENCE_LEVELS)[number];

export const DATA_SOURCE_KINDS = [
  "planning_estimate",
  "not_connected",
  "user_provided",
] as const;

export type DataSourceKind = (typeof DATA_SOURCE_KINDS)[number];

export const FIT_BANDS = ["weak", "moderate", "promising", "strong"] as const;
export type FitBand = (typeof FIT_BANDS)[number];

export const SCORE_BAND_COPY: Record<
  FitBand,
  { rangeLabel: string; interpretation: string }
> = {
  strong: {
    rangeLabel: "80–100",
    interpretation: "Strong preliminary fit",
  },
  promising: {
    rangeLabel: "65–79",
    interpretation: "Promising, with validation required",
  },
  moderate: {
    rangeLabel: "50–64",
    interpretation: "Significant planning gaps",
  },
  weak: {
    rangeLabel: "Below 50",
    interpretation: "High-risk preliminary fit",
  },
};

export type BusinessFitInput = {
  zipCode: string;
  businessType: BusinessType;
  cuisine: Cuisine;
  investmentBudget: InvestmentBudget;
  ownerExperience: OwnerExperience;
  facilitySize: FacilitySize;
  serviceModel: ServiceModel;
  targetOpeningDate: string;
};

export type MoneyRange = {
  lowUsd: number;
  highUsd: number;
  currency: "USD";
  label: string;
};

export type ScoreContribution = {
  key:
    | "base"
    | "budget_alignment"
    | "timeline_feasibility"
    | "owner_experience"
    | "facility_service_alignment"
    | "concept_complexity"
    | "bounds_adjustment";
  label: string;
  points: number;
  detail: string;
};

export type ScoreBreakdown = {
  contributions: ScoreContribution[];
  total: number;
};

export type TimelinePhase = {
  name: string;
  approximateMonths: number;
  detail: string;
};

export type TargetDateStatus =
  | "realistic"
  | "aggressive"
  | "unrealistic"
  | "past";

export type TimelineEstimate = {
  optimisticMonths: number;
  typicalMonths: number;
  conservativeMonths: number;
  summary: string;
  targetDateFeasible: boolean;
  targetDateStatus: TargetDateStatus;
  targetDateNote: string;
  phases: TimelinePhase[];
};

export type DataSourceNote = {
  domain: string;
  kind: DataSourceKind;
  note: string;
  asOf: string | null;
};

export type BudgetBreakdownCategory = {
  category: string;
  range: MoneyRange;
  notes: string;
};

export type ChecklistCategory = {
  category: string;
  items: string[];
  requiresLocalReview: boolean;
};

export type NextStepGroups = {
  doNow: string[];
  validateBeforeLease: string[];
  completeBeforeOpening: string[];
};

export type BusinessFitReport = {
  reportVersion: typeof REPORT_VERSION;
  estimatorVersion: typeof ESTIMATOR_VERSION;
  generatedAt: string;
  input: BusinessFitInput;
  fitScore: number;
  fitBand: FitBand;
  fitBandLabel: string;
  fitInterpretation: string;
  confidence: ConfidenceLevel;
  scoreBreakdown: ScoreBreakdown;
  assumptions: string[];
  missingInformation: string[];
  majorRisks: string[];
  nextSteps: string[];
  nextStepGroups: NextStepGroups;
  startupBudget: {
    total: MoneyRange;
    categories: BudgetBreakdownCategory[];
  };
  openingTimeline: TimelineEstimate;
  licensingChecklistCategories: ChecklistCategory[];
  equipmentCategories: string[];
  disclaimers: string[];
  dataSources: DataSourceNote[];
  printSummary: {
    inputSummary: string[];
    includeLogo: true;
    hideControls: true;
  };
  planningEstimateOnly: true;
};

export type ConceptComparisonResult = {
  reportVersion: typeof REPORT_VERSION;
  estimatorVersion: typeof ESTIMATOR_VERSION;
  generatedAt: string;
  concepts: Array<{
    label: string;
    input: BusinessFitInput;
    fitScore: number;
    fitBand: FitBand;
    startupBudget: MoneyRange;
    typicalMonths: number;
    topRisks: string[];
  }>;
  comparisonNotes: string[];
  disclaimers: string[];
  planningEstimateOnly: true;
};

export type StartupBudgetResult = {
  reportVersion: typeof REPORT_VERSION;
  estimatorVersion: typeof ESTIMATOR_VERSION;
  generatedAt: string;
  input: BusinessFitInput;
  total: MoneyRange;
  categories: BudgetBreakdownCategory[];
  assumptions: string[];
  disclaimers: string[];
  planningEstimateOnly: true;
};

export type OpeningChecklistResult = {
  reportVersion: typeof REPORT_VERSION;
  estimatorVersion: typeof ESTIMATOR_VERSION;
  generatedAt: string;
  input: BusinessFitInput;
  licensingChecklistCategories: ChecklistCategory[];
  equipmentCategories: string[];
  nextSteps: string[];
  nextStepGroups: NextStepGroups;
  disclaimers: string[];
  planningEstimateOnly: true;
};
