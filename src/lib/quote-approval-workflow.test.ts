import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  attemptSendQuoteToCustomer,
  calculateQuoteTotals,
  chefApproveQuoteDraft,
  chefEditQuoteDraft,
  chefRejectQuoteDraft,
  createQuoteDraft,
  publicSeasonalBoxPriceStillRequiresReview,
} from "@/lib/quote-approval-workflow";
import {
  DRAFT_PENDING_LABEL,
  emptyOperationalNeeds,
  emptyQuoteCostInputs,
  type QuoteIntake,
} from "@/lib/quote-draft";
import { formatPricingLabel } from "@/lib/curated-menu";

function sampleIntake(overrides?: Partial<QuoteIntake>): QuoteIntake {
  return {
    customerName: "Alex Customer",
    customerEmail: "alex@example.com",
    customerPhone: "4255550100",
    eventDate: "2026-09-15",
    eventLocation: "Bellevue · Office lobby",
    serviceRegion: "seattle",
    guestCount: 40,
    selectedMenuItems: [
      {
        menuItemId: "butter-chicken",
        name: "Butter Chicken",
      },
      {
        menuItemId: "tandoori-shrimp",
        name: "Tandoori Shrimp",
        marketPriced: true,
        riskFlags: ["seafood"],
      },
    ],
    portionOrServiceStyle: "Buffet",
    dietaryRequirements: "One nut allergy",
    operationalNeeds: emptyOperationalNeeds({
      deliveryNeeded: true,
      staffingNeeded: true,
      rentalNeeded: false,
    }),
    source: "ai_concierge",
    ...overrides,
  };
}

const completeCosts = emptyQuoteCostInputs({
  foodCost: 480,
  laborCost: 360,
  laborHours: 18,
  operatingOverhead: 120,
  packagingAndDisposables: 40,
  deliveryAndTravel: 80,
  rentalsOrEquipment: 0,
  administrativeOrPaymentProcessing: 30,
  contingencyOrWasteAllowance: 50,
  targetProfitMargin: 0.3,
  applicableSalesTax: 95.2,
  costDataAsOf: "2026-07-01",
});

describe("quote approval workflow", () => {
  it("creates every AI draft as Draft — Pending Chef Approval", () => {
    const draft = createQuoteDraft({
      intake: sampleIntake(),
      costs: completeCosts,
      actor: "ai_concierge",
    });

    assert.equal(draft.status, "draft_pending_chef_approval");
    assert.equal(draft.statusLabel, DRAFT_PENDING_LABEL);
    assert.equal(draft.customerSendEnabled, false);
    assert.ok(draft.calculation);
    assert.ok(draft.chefBreakdown);
    assert.ok(
      draft.manualApprovalReasons.includes("seafood") ||
        draft.manualApprovalReasons.includes("market_priced_ingredients"),
    );
    assert.ok(draft.manualApprovalReasons.includes("staffed_event"));
    assert.ok(
      draft.auditTrail.some((event) => event.type === "draft_created"),
    );
    assert.ok(draft.auditTrail.some((event) => event.type === "send_blocked"));
  });

  it("uses the required selling-price formula and builds chef breakdown", () => {
    const calculation = calculateQuoteTotals(completeCosts);
    assert.ok(calculation);

    // direct = 480+360+40+80+0+30 = 990
    assert.equal(calculation.directCost, 990);
    // before profit = 990+120+50 = 1160
    assert.equal(calculation.costBeforeProfit, 1160);
    // selling = 1160 / 0.7 = 1657.142... -> 1657.14
    assert.equal(calculation.sellingPriceBeforeTax, 1657.14);
    assert.equal(calculation.finalQuote, 1752.34);

    const draft = createQuoteDraft({
      intake: sampleIntake(),
      costs: completeCosts,
    });
    assert.equal(draft.chefBreakdown?.guestCount, 40);
    assert.equal(draft.chefBreakdown?.foodCostTotal, 480);
    assert.equal(draft.chefBreakdown?.foodCostPerPerson, 12);
    assert.equal(draft.chefBreakdown?.customerTotal, 1752.34);
  });

  it("does not invent costs and blocks approval when costs are missing", () => {
    const draft = createQuoteDraft({
      intake: sampleIntake(),
      costs: emptyQuoteCostInputs(),
    });

    assert.equal(draft.calculation, null);
    assert.ok(draft.issues.some((issue) => issue.code === "missing_cost"));
    assert.ok(
      draft.manualApprovalReasons.includes("missing_or_outdated_costs"),
    );

    const approval = chefApproveQuoteDraft(draft);
    assert.equal(approval.ok, false);
  });

  it("allows Chef Simbu to edit, approve, or reject with audit trail", () => {
    const draft = createQuoteDraft({
      intake: sampleIntake(),
      costs: completeCosts,
    });

    const edited = chefEditQuoteDraft(draft, {
      costs: { foodCost: 500 },
      chefNotes: "Increase food cost for premium shrimp.",
    });
    assert.equal(edited.status, "edited_pending_reapproval");
    assert.equal(edited.costs.foodCost, 500);
    assert.ok(edited.auditTrail.some((event) => event.type === "chef_edited"));

    const approved = chefApproveQuoteDraft(edited, "chef_simbu", "Approved after edit");
    assert.equal(approved.ok, true);
    if (approved.ok) {
      assert.equal(approved.draft.status, "approved");
      assert.equal(approved.draft.customerSendEnabled, false);
      assert.ok(
        approved.draft.auditTrail.some((event) => event.type === "chef_approved"),
      );
    }

    const rejected = chefRejectQuoteDraft(draft, "Guest count unclear");
    assert.equal(rejected.status, "rejected");
    assert.ok(
      rejected.auditTrail.some((event) => event.type === "chef_rejected"),
    );
  });

  it("never auto-sends quotes to customers, even when approved", () => {
    const draft = createQuoteDraft({
      intake: sampleIntake(),
      costs: completeCosts,
    });
    const approved = chefApproveQuoteDraft(draft);
    assert.equal(approved.ok, true);
    if (!approved.ok) {
      return;
    }

    const send = attemptSendQuoteToCustomer(approved.draft);
    assert.equal(send.ok, false);
    assert.equal(send.draft.status, "approved");
    assert.equal(send.draft.sentAt, undefined);
    assert.ok(send.draft.auditTrail.some((event) => event.type === "send_blocked"));
  });

  it("keeps public seasonal $18 unchanged and public pricing labels intact", () => {
    const seasonal = publicSeasonalBoxPriceStillRequiresReview();
    assert.equal(seasonal.publishedPricePerPerson, 18);
    assert.equal(seasonal.mayChangePublicPrice, false);
    assert.equal(formatPricingLabel("seasonal_18"), "$18 per person");
    assert.equal(formatPricingLabel("custom_quote"), "Request a Custom Quote");
    assert.equal(formatPricingLabel("market"), "Market pricing");
    assert.equal(
      formatPricingLabel("live_station_proposal"),
      "Chef-approved custom proposal",
    );
  });
});
