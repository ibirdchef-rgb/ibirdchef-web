/**
 * Internal quote draft / Chef Simbu approval workflow.
 *
 * Rules enforced here:
 * - Never invent missing ingredient or labor costs
 * - Never treat historical menu prices as current costs
 * - Never send a quote automatically to a customer
 * - Every AI-generated quote starts as Draft — Pending Chef Approval
 * - Only an explicitly approved quote may later be marked sendable
 * - Customer send remains disabled in this implementation pass
 */

import {
  DRAFT_PENDING_LABEL,
  emptyQuoteCostInputs,
  statusLabelFor,
  type ChefCostBreakdown,
  type ManualApprovalReason,
  type QuoteAuditEvent,
  type QuoteCalculation,
  type QuoteCostInputs,
  type QuoteCostIssue,
  type QuoteDraft,
  type QuoteDraftStatus,
  type QuoteIntake,
} from "@/lib/quote-draft";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 10000) / 100;
}

function appendAudit(
  draft: QuoteDraft,
  event: Omit<QuoteAuditEvent, "id" | "at"> & { at?: string },
): QuoteDraft {
  const entry: QuoteAuditEvent = {
    id: newId("audit"),
    at: event.at ?? nowIso(),
    type: event.type,
    actor: event.actor,
    detail: event.detail,
    previousStatus: event.previousStatus,
    nextStatus: event.nextStatus,
  };
  return {
    ...draft,
    updatedAt: entry.at,
    auditTrail: [...draft.auditTrail, entry],
  };
}

/** Reject any attempt to seed costs from historical public/menu prices. */
export function assertNotHistoricalMenuPrice(input: {
  label?: string;
  amount?: number | null;
  source?: string;
}): QuoteCostIssue | null {
  const source = (input.source ?? "").toLowerCase();
  const label = (input.label ?? "").toLowerCase();
  if (
    source.includes("historical") ||
    source.includes("menu price") ||
    source.includes("xlsx") ||
    source.includes("pdf menu") ||
    label.includes("historical menu price")
  ) {
    return {
      code: "historical_price_forbidden",
      field: "historicalMenuPrice",
      message:
        "Historical menu prices are not current costs and must not be used for quoting.",
    };
  }
  return null;
}

export function collectCostIssues(
  intake: QuoteIntake,
  costs: QuoteCostInputs,
  options?: { costDataMaxAgeDays?: number; now?: Date },
): QuoteCostIssue[] {
  const issues: QuoteCostIssue[] = [];
  const requiredFields: Array<keyof QuoteCostInputs> = [
    "foodCost",
    "laborCost",
    "operatingOverhead",
    "packagingAndDisposables",
    "deliveryAndTravel",
    "rentalsOrEquipment",
    "administrativeOrPaymentProcessing",
    "contingencyOrWasteAllowance",
    "targetProfitMargin",
    "applicableSalesTax",
  ];

  if (!isFiniteNumber(intake.guestCount) || intake.guestCount <= 0) {
    issues.push({
      code: "invalid_guest_count",
      field: "guestCount",
      message: "Guest count is required before a quote can be calculated.",
    });
  }

  for (const field of requiredFields) {
    if (!isFiniteNumber(costs[field] as number | null)) {
      issues.push({
        code: "missing_cost",
        field,
        message: `Missing current internal cost: ${field}. Do not invent a value.`,
      });
    }
  }

  if (
    isFiniteNumber(costs.targetProfitMargin) &&
    (costs.targetProfitMargin <= 0 || costs.targetProfitMargin >= 1)
  ) {
    issues.push({
      code: "invalid_margin",
      field: "targetProfitMargin",
      message:
        "Target profit margin must be a decimal fraction between 0 and 1 (exclusive).",
    });
  }

  if (!costs.costDataAsOf) {
    issues.push({
      code: "outdated_cost_data",
      field: "costDataAsOf",
      message:
        "Cost data date is missing. Flag for manual review before approval.",
    });
  } else {
    const asOf = new Date(costs.costDataAsOf);
    const now = options?.now ?? new Date();
    const maxAgeDays = options?.costDataMaxAgeDays ?? 90;
    if (Number.isNaN(asOf.getTime())) {
      issues.push({
        code: "outdated_cost_data",
        field: "costDataAsOf",
        message: "Cost data date is invalid and must be reviewed manually.",
      });
    } else {
      const ageMs = now.getTime() - asOf.getTime();
      if (ageMs > maxAgeDays * 24 * 60 * 60 * 1000) {
        issues.push({
          code: "outdated_cost_data",
          field: "costDataAsOf",
          message: `Cost data is older than ${maxAgeDays} days and requires manual review.`,
        });
      }
    }
  }

  return issues;
}

export function collectManualApprovalReasons(
  intake: QuoteIntake,
  costs: QuoteCostInputs,
  issues: QuoteCostIssue[],
): ManualApprovalReason[] {
  const reasons = new Set<ManualApprovalReason>();

  for (const item of intake.selectedMenuItems) {
    if (item.marketPriced) {
      reasons.add("market_priced_ingredients");
    }
    for (const flag of item.riskFlags ?? []) {
      if (flag === "seafood") reasons.add("seafood");
      if (flag === "lamb") reasons.add("lamb");
      if (flag === "goat") reasons.add("goat");
      if (flag === "premium_protein") reasons.add("market_priced_ingredients");
    }
    const name = item.name.toLowerCase();
    if (/\b(shrimp|fish|crab|calamari|seafood|pomfret)\b/.test(name)) {
      reasons.add("seafood");
    }
    if (/\blamb\b/.test(name)) {
      reasons.add("lamb");
    }
    if (/\bgoat\b|\bmutton\b/.test(name)) {
      reasons.add("goat");
    }
  }

  if (
    intake.operationalNeeds.rentalNeeded === true ||
    (isFiniteNumber(costs.rentalsOrEquipment) && costs.rentalsOrEquipment > 0)
  ) {
    reasons.add("rentals");
  }

  if (intake.operationalNeeds.staffingNeeded === true) {
    reasons.add("staffed_event");
  }

  if (issues.some((issue) => issue.code === "missing_cost" || issue.code === "outdated_cost_data")) {
    reasons.add("missing_or_outdated_costs");
  }

  const mentionsSeasonalBox = intake.selectedMenuItems.some((item) =>
    /boxed lunch|seasonal/i.test(item.name),
  );
  if (mentionsSeasonalBox) {
    reasons.add("seasonal_box_margin_unreviewed");
  }

  return [...reasons];
}

/**
 * Pure calculation from provided current costs.
 * Returns null when required numeric inputs are missing or invalid.
 */
export function calculateQuoteTotals(
  costs: QuoteCostInputs,
): QuoteCalculation | null {
  const required = [
    costs.foodCost,
    costs.laborCost,
    costs.packagingAndDisposables,
    costs.deliveryAndTravel,
    costs.rentalsOrEquipment,
    costs.administrativeOrPaymentProcessing,
    costs.operatingOverhead,
    costs.contingencyOrWasteAllowance,
    costs.targetProfitMargin,
    costs.applicableSalesTax,
  ];
  if (!required.every(isFiniteNumber)) {
    return null;
  }
  if (costs.targetProfitMargin! <= 0 || costs.targetProfitMargin! >= 1) {
    return null;
  }

  const otherDirect = costs.administrativeOrPaymentProcessing!;
  const directCost = roundCurrency(
    costs.foodCost! +
      costs.laborCost! +
      costs.packagingAndDisposables! +
      costs.deliveryAndTravel! +
      costs.rentalsOrEquipment! +
      otherDirect,
  );
  const costBeforeProfit = roundCurrency(
    directCost + costs.operatingOverhead! + costs.contingencyOrWasteAllowance!,
  );
  const sellingPriceBeforeTax = roundCurrency(
    costBeforeProfit / (1 - costs.targetProfitMargin!),
  );
  const finalQuote = roundCurrency(
    sellingPriceBeforeTax + costs.applicableSalesTax!,
  );

  return {
    directCost,
    costBeforeProfit,
    sellingPriceBeforeTax,
    finalQuote,
    formulas: {
      directCost:
        "food + labor + packaging + delivery + rentals + other direct expenses",
      costBeforeProfit: "direct cost + allocated overhead + contingency",
      sellingPriceBeforeTax:
        "cost before profit ÷ (1 - target profit margin)",
      finalQuote: "selling price before tax + applicable tax",
    },
  };
}

export function buildChefCostBreakdown(
  intake: QuoteIntake,
  costs: QuoteCostInputs,
  calculation: QuoteCalculation,
): ChefCostBreakdown | null {
  if (!isFiniteNumber(intake.guestCount) || intake.guestCount <= 0) {
    return null;
  }
  if (
    !isFiniteNumber(costs.foodCost) ||
    !isFiniteNumber(costs.laborCost) ||
    !isFiniteNumber(costs.operatingOverhead) ||
    !isFiniteNumber(costs.deliveryAndTravel) ||
    !isFiniteNumber(costs.rentalsOrEquipment) ||
    !isFiniteNumber(costs.contingencyOrWasteAllowance) ||
    !isFiniteNumber(costs.applicableSalesTax)
  ) {
    return null;
  }

  const guestCount = intake.guestCount;
  const totalCost = calculation.costBeforeProfit;
  const selling = calculation.sellingPriceBeforeTax;
  const grossProfit = roundCurrency(selling - totalCost);
  const deliverySetupRentals = roundCurrency(
    costs.deliveryAndTravel + costs.rentalsOrEquipment,
  );

  return {
    guestCount,
    foodCostTotal: roundCurrency(costs.foodCost),
    foodCostPerPerson: roundCurrency(costs.foodCost / guestCount),
    foodCostPercentage: roundPercent((costs.foodCost / selling) * 100),
    laborHours: isFiniteNumber(costs.laborHours) ? costs.laborHours : null,
    laborCost: roundCurrency(costs.laborCost),
    laborCostPercentage: roundPercent((costs.laborCost / selling) * 100),
    overhead: roundCurrency(costs.operatingOverhead),
    deliverySetupRentals,
    contingency: roundCurrency(costs.contingencyOrWasteAllowance),
    totalCost: roundCurrency(totalCost),
    proposedSellingPricePerPerson: roundCurrency(selling / guestCount),
    grossProfitDollars: grossProfit,
    profitMarginPercentage: roundPercent((grossProfit / selling) * 100),
    tax: roundCurrency(costs.applicableSalesTax),
    customerTotal: roundCurrency(calculation.finalQuote),
  };
}

export type CreateQuoteDraftInput = {
  intake: QuoteIntake;
  costs?: QuoteCostInputs;
  actor?: QuoteAuditEvent["actor"];
};

/**
 * Creates an internal draft. Always starts as Draft — Pending Chef Approval.
 * Does not send anything to the customer.
 */
export function createQuoteDraft(input: CreateQuoteDraftInput): QuoteDraft {
  const createdAt = nowIso();
  const costs = input.costs ?? emptyQuoteCostInputs();
  const issues = collectCostIssues(input.intake, costs);
  const calculation = issues.some(
    (issue) =>
      issue.code === "missing_cost" ||
      issue.code === "invalid_margin" ||
      issue.code === "invalid_guest_count",
  )
    ? null
    : calculateQuoteTotals(costs);
  const chefBreakdown =
    calculation && input.intake.guestCount
      ? buildChefCostBreakdown(input.intake, costs, calculation)
      : null;
  const manualApprovalReasons = collectManualApprovalReasons(
    input.intake,
    costs,
    issues,
  );

  const status: QuoteDraftStatus = "draft_pending_chef_approval";
  let draft: QuoteDraft = {
    id: newId("quote"),
    status,
    statusLabel: DRAFT_PENDING_LABEL,
    createdAt,
    updatedAt: createdAt,
    intake: input.intake,
    costs,
    issues,
    manualApprovalRequired: true,
    manualApprovalReasons,
    calculation,
    chefBreakdown,
    auditTrail: [],
    customerSendEnabled: false,
  };

  draft = appendAudit(draft, {
    type: "draft_created",
    actor: input.actor ?? "ai_concierge",
    detail: `${DRAFT_PENDING_LABEL}. Saved for Chef Simbu review. Customer send is disabled.`,
    nextStatus: status,
  });

  if (issues.length) {
    draft = appendAudit(draft, {
      type: "flagged_for_manual_review",
      actor: "system",
      detail: `Flagged ${issues.length} cost/data issue(s) for manual review.`,
      previousStatus: status,
      nextStatus: status,
    });
  }

  if (calculation) {
    draft = appendAudit(draft, {
      type: "calculation_completed",
      actor: "system",
      detail: "Internal calculation completed from provided current costs.",
      previousStatus: status,
      nextStatus: status,
    });
  }

  draft = appendAudit(draft, {
    type: "send_blocked",
    actor: "system",
    detail:
      "Automatic customer quoting/sending is not activated. Draft routed to Chef Simbu only.",
    previousStatus: status,
    nextStatus: status,
  });

  return draft;
}

export function chefEditQuoteDraft(
  draft: QuoteDraft,
  updates: {
    costs?: Partial<QuoteCostInputs>;
    intake?: Partial<QuoteIntake>;
    chefNotes?: string;
  },
  actor: "chef_simbu" | "staff" = "chef_simbu",
): QuoteDraft {
  const nextIntake = { ...draft.intake, ...updates.intake };
  const nextCosts = { ...draft.costs, ...updates.costs };
  const issues = collectCostIssues(nextIntake, nextCosts);
  const canCalculate = !issues.some(
    (issue) =>
      issue.code === "missing_cost" ||
      issue.code === "invalid_margin" ||
      issue.code === "invalid_guest_count",
  );
  const calculation = canCalculate ? calculateQuoteTotals(nextCosts) : null;
  const chefBreakdown =
    calculation && nextIntake.guestCount
      ? buildChefCostBreakdown(nextIntake, nextCosts, calculation)
      : null;
  const previousStatus = draft.status;
  const status: QuoteDraftStatus = "edited_pending_reapproval";

  let next: QuoteDraft = {
    ...draft,
    status,
    statusLabel: statusLabelFor(status),
    intake: nextIntake,
    costs: nextCosts,
    issues,
    manualApprovalRequired: true,
    manualApprovalReasons: collectManualApprovalReasons(
      nextIntake,
      nextCosts,
      issues,
    ),
    calculation,
    chefBreakdown,
    chefNotes: updates.chefNotes ?? draft.chefNotes,
    approvedAt: undefined,
    rejectedAt: undefined,
    sentAt: undefined,
    customerSendEnabled: false,
  };

  next = appendAudit(next, {
    type: "chef_edited",
    actor,
    detail: "Quote edited. Requires Chef Simbu re-approval before any customer send.",
    previousStatus,
    nextStatus: status,
  });

  return next;
}

export function chefApproveQuoteDraft(
  draft: QuoteDraft,
  actor: "chef_simbu" = "chef_simbu",
  notes?: string,
): { ok: true; draft: QuoteDraft } | { ok: false; error: string; draft: QuoteDraft } {
  if (draft.issues.some((issue) => issue.code === "missing_cost")) {
    return {
      ok: false,
      error:
        "Cannot approve while required current costs are missing. Do not invent values.",
      draft,
    };
  }
  if (!draft.calculation || !draft.chefBreakdown) {
    return {
      ok: false,
      error: "Cannot approve without a completed internal calculation and chef breakdown.",
      draft,
    };
  }

  const previousStatus = draft.status;
  const approvedAt = nowIso();
  let next: QuoteDraft = {
    ...draft,
    status: "approved",
    statusLabel: "Approved",
    approvedAt,
    rejectedAt: undefined,
    chefNotes: notes ?? draft.chefNotes,
    // Still false: this pass does not activate customer sending.
    customerSendEnabled: false,
  };

  next = appendAudit(next, {
    type: "chef_approved",
    actor,
    detail:
      "Chef Simbu approved the draft. Customer send remains inactive until a future send integration is explicitly enabled.",
    previousStatus,
    nextStatus: "approved",
    at: approvedAt,
  });

  return { ok: true, draft: next };
}

export function chefRejectQuoteDraft(
  draft: QuoteDraft,
  reason: string,
  actor: "chef_simbu" = "chef_simbu",
): QuoteDraft {
  const previousStatus = draft.status;
  const rejectedAt = nowIso();
  let next: QuoteDraft = {
    ...draft,
    status: "rejected",
    statusLabel: "Rejected",
    rejectedAt,
    approvedAt: undefined,
    sentAt: undefined,
    chefNotes: reason,
    customerSendEnabled: false,
  };

  next = appendAudit(next, {
    type: "chef_rejected",
    actor,
    detail: reason,
    previousStatus,
    nextStatus: "rejected",
    at: rejectedAt,
  });

  return next;
}

/**
 * Customer send is intentionally not activated.
 * Even approved drafts cannot be marked sent in this pass.
 */
export function attemptSendQuoteToCustomer(draft: QuoteDraft): {
  ok: false;
  error: string;
  draft: QuoteDraft;
} {
  const previousStatus = draft.status;
  const next = appendAudit(draft, {
    type: "send_blocked",
    actor: "system",
    detail:
      draft.status === "approved"
        ? "Send blocked: automatic/customer quoting is not activated in this implementation pass, even for approved drafts."
        : `Send blocked: quote status is "${draft.statusLabel}". Only an explicitly approved quote may be sent after send activation.`,
    previousStatus,
    nextStatus: draft.status,
  });

  return {
    ok: false,
    error:
      "Customer quote sending is not activated. Approved drafts remain internal until a future send integration is enabled.",
    draft: next,
  };
}

export function canRevealInternalCostsToCustomer(): false {
  return false;
}

export function publicSeasonalBoxPriceStillRequiresReview(): {
  publishedPricePerPerson: 18;
  mayChangePublicPrice: false;
  reason: string;
} {
  return {
    publishedPricePerPerson: 18,
    mayChangePublicPrice: false,
    reason:
      "Do not change the public $18 seasonal price until current food, labor, overhead, and profit have been reviewed.",
  };
}
