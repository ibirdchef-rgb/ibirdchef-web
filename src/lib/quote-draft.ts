/**
 * Internal quote draft + Chef Simbu approval model.
 *
 * Public curated-menu V1 pricing labels are NOT financial approval.
 * Historical menu prices must never be treated as current costs.
 * This module does not send quotes to customers.
 */

import type { ServiceRegion } from "@/lib/regions";

export const QUOTE_DRAFT_STATUS = [
  "draft_pending_chef_approval",
  "approved",
  "rejected",
  "edited_pending_reapproval",
  "sent_to_customer",
] as const;

export type QuoteDraftStatus = (typeof QUOTE_DRAFT_STATUS)[number];

export const DRAFT_PENDING_LABEL = "Draft — Pending Chef Approval" as const;

/** Cost inputs that must come from current internal records — never invented. */
export type QuoteCostInputs = {
  foodCost: number | null;
  laborCost: number | null;
  /** Prep, cooking, packing, delivery, and service hours when known. */
  laborHours: number | null;
  operatingOverhead: number | null;
  packagingAndDisposables: number | null;
  deliveryAndTravel: number | null;
  rentalsOrEquipment: number | null;
  administrativeOrPaymentProcessing: number | null;
  contingencyOrWasteAllowance: number | null;
  /** Decimal fraction, e.g. 0.3 for 30%. */
  targetProfitMargin: number | null;
  /** Absolute tax dollars for the event, when known. */
  applicableSalesTax: number | null;
  /** ISO date of the cost data used; null means unknown/outdated risk. */
  costDataAsOf: string | null;
};

export type QuoteMenuSelection = {
  menuItemId: string;
  name: string;
  quantity?: number;
  notes?: string;
  /** True when public pricing kind is market or item is seafood/lamb/goat. */
  marketPriced?: boolean;
  riskFlags?: Array<"seafood" | "lamb" | "goat" | "premium_protein">;
};

export type QuoteOperationalNeeds = {
  deliveryNeeded: boolean | null;
  setupNeeded: boolean | null;
  staffingNeeded: boolean | null;
  equipmentNeeded: boolean | null;
  rentalNeeded: boolean | null;
  notes?: string;
};

/** Intake the AI Concierge may collect before costing. */
export type QuoteIntake = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventDate: string;
  eventLocation: string;
  serviceRegion: ServiceRegion | "";
  guestCount: number | null;
  selectedMenuItems: QuoteMenuSelection[];
  portionOrServiceStyle: string;
  dietaryRequirements: string;
  operationalNeeds: QuoteOperationalNeeds;
  inquirySubmissionId?: string;
  source: "ai_concierge" | "website_inquiry" | "manual";
};

export type QuoteCalculation = {
  directCost: number;
  costBeforeProfit: number;
  sellingPriceBeforeTax: number;
  finalQuote: number;
  formulas: {
    directCost:
      "food + labor + packaging + delivery + rentals + other direct expenses";
    costBeforeProfit: "direct cost + allocated overhead + contingency";
    sellingPriceBeforeTax: "cost before profit ÷ (1 - target profit margin)";
    finalQuote: "selling price before tax + applicable tax";
  };
};

/** Internal breakdown shown to Chef Simbu — never to customers via AI. */
export type ChefCostBreakdown = {
  guestCount: number;
  foodCostTotal: number;
  foodCostPerPerson: number;
  foodCostPercentage: number;
  laborHours: number | null;
  laborCost: number;
  laborCostPercentage: number;
  overhead: number;
  deliverySetupRentals: number;
  contingency: number;
  totalCost: number;
  proposedSellingPricePerPerson: number;
  grossProfitDollars: number;
  profitMarginPercentage: number;
  tax: number;
  customerTotal: number;
};

export type QuoteCostIssue = {
  code:
    | "missing_cost"
    | "outdated_cost_data"
    | "invalid_margin"
    | "invalid_guest_count"
    | "historical_price_forbidden"
    | "invented_cost_forbidden";
  field?: keyof QuoteCostInputs | "guestCount" | "historicalMenuPrice";
  message: string;
};

export type ManualApprovalReason =
  | "seafood"
  | "lamb"
  | "goat"
  | "rentals"
  | "staffed_event"
  | "market_priced_ingredients"
  | "missing_or_outdated_costs"
  | "seasonal_box_margin_unreviewed";

export type QuoteAuditEventType =
  | "draft_created"
  | "costs_reviewed"
  | "calculation_completed"
  | "flagged_for_manual_review"
  | "chef_edited"
  | "chef_approved"
  | "chef_rejected"
  | "send_blocked"
  | "sent_to_customer";

export type QuoteAuditEvent = {
  id: string;
  type: QuoteAuditEventType;
  at: string;
  actor: "system" | "ai_concierge" | "chef_simbu" | "staff";
  detail: string;
  previousStatus?: QuoteDraftStatus;
  nextStatus?: QuoteDraftStatus;
};

export type QuoteDraft = {
  id: string;
  status: QuoteDraftStatus;
  statusLabel: typeof DRAFT_PENDING_LABEL | "Approved" | "Rejected" | "Edited — Pending Reapproval" | "Sent to Customer";
  createdAt: string;
  updatedAt: string;
  intake: QuoteIntake;
  costs: QuoteCostInputs;
  issues: QuoteCostIssue[];
  manualApprovalRequired: boolean;
  manualApprovalReasons: ManualApprovalReason[];
  calculation: QuoteCalculation | null;
  chefBreakdown: ChefCostBreakdown | null;
  chefNotes?: string;
  auditTrail: QuoteAuditEvent[];
  /**
   * Explicit gate: customer send is never automatic in this pass.
   * Remains false until a future approved send integration is enabled
   * AND Chef Simbu has approved the draft.
   */
  customerSendEnabled: false;
  approvedAt?: string;
  rejectedAt?: string;
  sentAt?: string;
};

export function emptyQuoteCostInputs(
  overrides?: Partial<QuoteCostInputs>,
): QuoteCostInputs {
  return {
    foodCost: null,
    laborCost: null,
    laborHours: null,
    operatingOverhead: null,
    packagingAndDisposables: null,
    deliveryAndTravel: null,
    rentalsOrEquipment: null,
    administrativeOrPaymentProcessing: null,
    contingencyOrWasteAllowance: null,
    targetProfitMargin: null,
    applicableSalesTax: null,
    costDataAsOf: null,
    ...overrides,
  };
}

export function emptyOperationalNeeds(
  overrides?: Partial<QuoteOperationalNeeds>,
): QuoteOperationalNeeds {
  return {
    deliveryNeeded: null,
    setupNeeded: null,
    staffingNeeded: null,
    equipmentNeeded: null,
    rentalNeeded: null,
    ...overrides,
  };
}

export function statusLabelFor(status: QuoteDraftStatus): QuoteDraft["statusLabel"] {
  switch (status) {
    case "draft_pending_chef_approval":
      return DRAFT_PENDING_LABEL;
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "edited_pending_reapproval":
      return "Edited — Pending Reapproval";
    case "sent_to_customer":
      return "Sent to Customer";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
