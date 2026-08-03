import { PHASE1_ASSUMPTIONS, PHASE1_DISCLAIMERS } from "@/lib/business-fit/disclaimers";
import {
  buildDataSources,
  buildEquipmentCategories,
  buildInputSummary,
  buildLicensingChecklist,
  buildNextStepGroups,
  buildNextSteps,
  estimateOpeningTimeline,
  estimateStartupBudget,
} from "@/lib/business-fit/estimator";
import { scoreBusinessFit } from "@/lib/business-fit/scoring";
import {
  ESTIMATOR_VERSION,
  REPORT_VERSION,
  type BusinessFitInput,
  type BusinessFitReport,
  type OpeningChecklistResult,
  type StartupBudgetResult,
} from "@/lib/business-fit/types";

export function buildBusinessFitReport(
  input: BusinessFitInput,
  options?: { now?: Date },
): BusinessFitReport {
  const now = options?.now ?? new Date();
  const generatedAt = now.toISOString();
  const scored = scoreBusinessFit(input, now);
  const startupBudget = estimateStartupBudget(input);
  const openingTimeline = estimateOpeningTimeline(input, now);
  const nextStepGroups = buildNextStepGroups(input);

  return {
    reportVersion: REPORT_VERSION,
    estimatorVersion: ESTIMATOR_VERSION,
    generatedAt,
    input,
    fitScore: scored.fitScore,
    fitBand: scored.fitBand,
    fitBandLabel: scored.fitBandLabel,
    fitInterpretation: scored.fitInterpretation,
    confidence: scored.confidence,
    scoreBreakdown: scored.scoreBreakdown,
    assumptions: [...PHASE1_ASSUMPTIONS],
    missingInformation: scored.missingInformation,
    majorRisks: scored.majorRisks,
    nextSteps: buildNextSteps(input),
    nextStepGroups,
    startupBudget,
    openingTimeline,
    licensingChecklistCategories: buildLicensingChecklist(input),
    equipmentCategories: buildEquipmentCategories(input),
    disclaimers: [...PHASE1_DISCLAIMERS],
    dataSources: buildDataSources(generatedAt),
    printSummary: {
      inputSummary: buildInputSummary(input),
      includeLogo: true,
      hideControls: true,
    },
    planningEstimateOnly: true,
  };
}

export function buildStartupBudgetResult(
  input: BusinessFitInput,
  options?: { now?: Date },
): StartupBudgetResult {
  const now = options?.now ?? new Date();
  const generatedAt = now.toISOString();
  const startupBudget = estimateStartupBudget(input);

  return {
    reportVersion: REPORT_VERSION,
    estimatorVersion: ESTIMATOR_VERSION,
    generatedAt,
    input,
    total: startupBudget.total,
    categories: startupBudget.categories,
    assumptions: [...PHASE1_ASSUMPTIONS],
    disclaimers: [...PHASE1_DISCLAIMERS],
    planningEstimateOnly: true,
  };
}

export function buildOpeningChecklistResult(
  input: BusinessFitInput,
  options?: { now?: Date },
): OpeningChecklistResult {
  const now = options?.now ?? new Date();
  const generatedAt = now.toISOString();
  const nextStepGroups = buildNextStepGroups(input);

  return {
    reportVersion: REPORT_VERSION,
    estimatorVersion: ESTIMATOR_VERSION,
    generatedAt,
    input,
    licensingChecklistCategories: buildLicensingChecklist(input),
    equipmentCategories: buildEquipmentCategories(input),
    nextSteps: buildNextSteps(input),
    nextStepGroups,
    disclaimers: [...PHASE1_DISCLAIMERS],
    planningEstimateOnly: true,
  };
}
