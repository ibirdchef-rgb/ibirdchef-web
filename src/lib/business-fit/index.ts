export { PHASE1_ASSUMPTIONS, PHASE1_DISCLAIMERS } from "@/lib/business-fit/disclaimers";
export {
  compareFoodServiceConcepts,
  type CompareConcept,
} from "@/lib/business-fit/compare";
export {
  BUDGET_CATEGORY_NAMES,
  buildDataSources,
  buildEquipmentCategories,
  buildInputSummary,
  buildLicensingChecklist,
  buildNextStepGroups,
  buildNextSteps,
  estimateOpeningTimeline,
  estimateStartupBudget,
} from "@/lib/business-fit/estimator";
export {
  buildBusinessFitReport,
  buildOpeningChecklistResult,
  buildStartupBudgetResult,
} from "@/lib/business-fit/report";
export {
  businessFitInputSchema,
  compareConceptsInputSchema,
  parseBusinessFitInput,
  parseCompareConceptsInput,
} from "@/lib/business-fit/schema";
export {
  budgetMidThousands,
  conceptCostMidThousands,
  fitBandForScore,
  scoreBusinessFit,
  scoreInterpretation,
} from "@/lib/business-fit/scoring";
export {
  BUSINESS_TYPES,
  CUISINES,
  ESTIMATOR_VERSION,
  FACILITY_SIZES,
  INVESTMENT_BUDGETS,
  OWNER_EXPERIENCE,
  REPORT_VERSION,
  SCORE_BAND_COPY,
  SERVICE_MODELS,
  type BusinessFitInput,
  type BusinessFitReport,
  type ConceptComparisonResult,
  type OpeningChecklistResult,
  type StartupBudgetResult,
} from "@/lib/business-fit/types";
