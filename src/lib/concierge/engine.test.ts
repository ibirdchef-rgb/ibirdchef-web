import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { curatedMenuItems } from "@/lib/curated-menu";
import { DRAFT_PENDING_LABEL } from "@/lib/quote-draft";
import {
  AVAILABILITY_SAFE_RESPONSE,
  CONCIERGE_WELCOME,
  PRICE_SAFE_RESPONSE,
} from "@/lib/concierge/types";
import {
  createConciergeSession,
  processConciergeMessage,
  removeDish,
  selectDish,
  submitConciergeInquiry,
} from "@/lib/concierge/engine";
import {
  findApprovedDishesByText,
  recommendApprovedDishes,
} from "@/lib/concierge/menu-retrieval";

describe("AI catering concierge phase 1", () => {
  it("starts with the approved welcome message and audit trail", () => {
    const session = createConciergeSession();
    assert.equal(session.messages[0]?.content, CONCIERGE_WELCOME);
    assert.ok(session.auditTrail.some((event) => event.type === "session_started"));
    assert.equal(session.phase, "welcome");
  });

  it("handles the Bellevue lunch example with one or two useful follow-ups", () => {
    let session = createConciergeSession();
    const result = processConciergeMessage(
      session,
      "I need lunch for 50 people in Bellevue.",
    );
    session = result.session;

    assert.equal(session.slots.guestCount, 50);
    assert.equal(session.slots.cityOrZip, "Bellevue");
    assert.equal(session.slots.serviceRegion, "seattle");
    assert.match(result.assistantReply, /50 guests in Bellevue/i);
    assert.match(result.assistantReply, /packaged meals or a buffet/i);
    assert.match(result.assistantReply, /date/i);
    assert.match(result.assistantReply, /spend per person/i);
  });

  it("uses the safe price response and never invents a quote amount", () => {
    let session = createConciergeSession();
    session = processConciergeMessage(session, "Corporate lunch").session;
    const result = processConciergeMessage(
      session,
      "What's the price for 40 guests?",
    );

    assert.match(result.assistantReply, new RegExp(PRICE_SAFE_RESPONSE));
    assert.doesNotMatch(result.assistantReply, /\$\d+/);
    assert.ok(
      result.session.auditTrail.some(
        (event) =>
          event.type === "safety_response" &&
          event.detail.includes("Price request"),
      ),
    );
  });

  it("does not treat a budget answer as a price request", () => {
    let session = createConciergeSession();
    session = processConciergeMessage(session, "Birthday dinner").session;
    session = processConciergeMessage(session, "30 guests").session;
    session = processConciergeMessage(session, "Seattle Area, Redmond").session;
    session = processConciergeMessage(session, "Buffet").session;
    session = processConciergeMessage(session, "September 20, 2026 at 6pm").session;
    const result = processConciergeMessage(
      session,
      "About $35 per person budget",
    );

    assert.equal(result.session.slots.budgetNotes.includes("35"), true);
    assert.doesNotMatch(result.assistantReply, new RegExp(PRICE_SAFE_RESPONSE));
  });

  it("uses the safe availability response and never confirms booking", () => {
    let session = createConciergeSession();
    session = processConciergeMessage(session, "Team lunch").session;
    const result = processConciergeMessage(
      session,
      "Are you available on September 12?",
    );

    assert.match(result.assistantReply, new RegExp(AVAILABILITY_SAFE_RESPONSE));
    assert.doesNotMatch(
      result.assistantReply,
      /\b(booking confirmed|we can confirm|you(?:'re| are) booked|reserved for you)\b/i,
    );
    assert.ok(
      result.session.auditTrail.some(
        (event) =>
          event.type === "safety_response" &&
          event.detail.includes("Availability"),
      ),
    );
  });

  it("recommends only approved curated menu dishes", () => {
    const approvedIds = new Set(curatedMenuItems.map((item) => item.id));
    assert.equal(curatedMenuItems.length, 78);

    const suggestions = recommendApprovedDishes(
      {
        eventType: "Corporate lunch",
        eventCategory: "corporate",
        eventDate: "2026-10-01",
        eventTime: "12:00",
        cityOrZip: "Bellevue",
        serviceRegion: "seattle",
        guestCount: 40,
        budgetNotes: "$25 per person",
        cuisinePreference: "Indian",
        serviceStyle: "Buffet",
        dietaryRequirements: "None",
        deliveryNeeded: true,
        setupNeeded: false,
        staffingNeeded: false,
        rentalsNeeded: false,
        equipmentNeeded: false,
        operationalNotes: "",
        selectedDishIds: [],
        customerName: "",
        customerEmail: "",
        customerPhone: "",
      },
      6,
    );

    assert.ok(suggestions.length > 0);
    for (const suggestion of suggestions) {
      assert.ok(approvedIds.has(suggestion.id));
      assert.ok(curatedMenuItems.some((item) => item.name === suggestion.name));
    }

    assert.equal(findApprovedDishesByText("Invented Magical Curry").length, 0);
    assert.ok(findApprovedDishesByText("Butter Chicken").length >= 1);
  });

  it("supports multi-item selection without replacing prior dishes", () => {
    let session = createConciergeSession();
    session = selectDish(session, "butter-chicken").session;
    session = selectDish(session, "yellow-dal").session;
    session = selectDish(session, "garlic-naan").session;

    assert.deepEqual(session.slots.selectedDishIds, [
      "butter-chicken",
      "yellow-dal",
      "garlic-naan",
    ]);

    session = removeDish(session, "yellow-dal").session;
    assert.deepEqual(session.slots.selectedDishIds, [
      "butter-chicken",
      "garlic-naan",
    ]);
    assert.match(
      session.messages.at(-1)?.content ?? "",
      /without replacing your choices/i,
    );
  });

  it("rejects unknown dish ids", () => {
    const session = createConciergeSession();
    const result = selectDish(session, "not-a-real-dish");
    assert.match(result.assistantReply, /approved public menu/i);
    assert.equal(result.session.slots.selectedDishIds.length, 0);
  });

  it("never claims to be Chef Simbu and offers human help", () => {
    const session = createConciergeSession();
    const result = processConciergeMessage(
      session,
      "Can I speak to Chef Simbu or a real person?",
    );
    assert.match(result.assistantReply, /not Chef Simbu/i);
    assert.ok(
      result.session.auditTrail.some(
        (event) => event.type === "human_handoff_offered",
      ),
    );
  });

  it("creates an internal draft pending Chef approval and blocks customer send", () => {
    let session = createConciergeSession();
    const turns = [
      "Corporate team lunch",
      "40 people",
      "Bellevue, Seattle Area",
      "Boxed meals",
      "October 10, 2026 at 12pm",
      "About $25 per person",
      "Indian",
      "One vegetarian guest, no nut allergy claimed yet",
      "Delivery and setup needed, no staffing",
      "Please recommend a balanced menu",
    ];

    for (const turn of turns) {
      session = processConciergeMessage(session, turn).session;
    }

    const butter = curatedMenuItems.find((item) => item.id === "butter-chicken");
    assert.ok(butter);
    session = selectDish(session, "butter-chicken").session;
    session = selectDish(session, "steamed-basmati-rice").session;
    session = selectDish(session, "garlic-naan").session;
    session = selectDish(session, "saffron-rice-kheer").session;

    session = processConciergeMessage(
      session,
      "Alex Customer, alex@example.com, 425-555-0100",
    ).session;

    // Fill contact fields if still split across questions.
    if (!session.slots.customerName) {
      session = processConciergeMessage(session, "Alex Customer").session;
    }
    if (!session.slots.customerEmail) {
      session = processConciergeMessage(session, "alex@example.com").session;
    }
    if (!session.slots.customerPhone) {
      session = processConciergeMessage(session, "425-555-0100").session;
    }

    const submitted = submitConciergeInquiry(session);
    assert.equal(submitted.session.quoteStatusLabel, DRAFT_PENDING_LABEL);
    assert.match(submitted.assistantReply, /Draft — Pending Chef Approval/);
    assert.match(submitted.assistantReply, /not sent a quote/i);
    assert.match(submitted.assistantReply, /not Chef Simbu/i);
    assert.ok(submitted.session.inquiryHref?.includes("askDishes="));
    assert.ok(
      submitted.session.auditTrail.some(
        (event) => event.type === "quote_draft_created",
      ),
    );
    assert.ok(
      submitted.session.auditTrail.some(
        (event) => event.type === "inquiry_prefill_prepared",
      ),
    );
    assert.doesNotMatch(submitted.assistantReply, /booking confirmed/i);
  });

  it("explains dietary confirmation is required", () => {
    let session = createConciergeSession();
    session = processConciergeMessage(session, "Wedding dinner").session;
    session = processConciergeMessage(session, "80 guests").session;
    session = processConciergeMessage(session, "Fremont, Bay Area").session;
    session = processConciergeMessage(session, "Buffet").session;
    session = processConciergeMessage(session, "November 1, 2026").session;
    session = processConciergeMessage(session, "$40 per person").session;
    session = processConciergeMessage(session, "Indian").session;
    const result = processConciergeMessage(
      session,
      "Several vegan guests and one peanut allergy",
    );
    assert.match(
      result.assistantReply,
      /require culinary confirmation/i,
    );
  });
});
