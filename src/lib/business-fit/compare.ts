import { PHASE1_DISCLAIMERS } from "@/lib/business-fit/disclaimers";
import { estimateOpeningTimeline, estimateStartupBudget } from "@/lib/business-fit/estimator";
import { buildBusinessFitReport } from "@/lib/business-fit/report";
import {
  ESTIMATOR_VERSION,
  REPORT_VERSION,
  type BusinessFitInput,
  type ConceptComparisonResult,
} from "@/lib/business-fit/types";

export type CompareConcept = {
  label: string;
  input: BusinessFitInput;
};

export function compareFoodServiceConcepts(
  concepts: CompareConcept[],
  options?: { now?: Date },
): ConceptComparisonResult {
  const now = options?.now ?? new Date();
  const generatedAt = now.toISOString();

  const ranked = concepts.map((concept) => {
    const report = buildBusinessFitReport(concept.input, { now });
    const budget = estimateStartupBudget(concept.input);
    const timeline = estimateOpeningTimeline(concept.input, now);
    return {
      label: concept.label,
      input: concept.input,
      fitScore: report.fitScore,
      fitBand: report.fitBand,
      startupBudget: budget.total,
      typicalMonths: timeline.typicalMonths,
      topRisks: report.majorRisks.slice(0, 3),
    };
  });

  ranked.sort((a, b) => b.fitScore - a.fitScore);

  const comparisonNotes = [
    "Ranking uses the same deterministic Phase 1 model for every concept; it is not market proof.",
    "Higher scores reflect planning alignment of capital, experience, facility, and timeline—not predicted profit.",
    "No live rent, demographic, competition, or licensing feeds were used.",
  ];

  if (ranked.length >= 2 && ranked[0].fitScore === ranked[1].fitScore) {
    comparisonNotes.push(
      "Top concepts tied on fit score; differentiate with local due diligence and clearer capital plans.",
    );
  }

  return {
    reportVersion: REPORT_VERSION,
    estimatorVersion: ESTIMATOR_VERSION,
    generatedAt,
    concepts: ranked,
    comparisonNotes,
    disclaimers: [...PHASE1_DISCLAIMERS],
    planningEstimateOnly: true,
  };
}
