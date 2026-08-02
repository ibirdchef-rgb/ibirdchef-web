import {
  buildInquiryHrefForItemIds,
  PUBLIC_MENU_CATEGORY_LABELS,
} from "@/lib/curated-menu";
import {
  createQuoteDraft,
} from "@/lib/quote-approval-workflow";
import {
  emptyOperationalNeeds,
  emptyQuoteCostInputs,
  type QuoteIntake,
} from "@/lib/quote-draft";
import {
  AVAILABILITY_SAFE_RESPONSE,
  CONCIERGE_WELCOME,
  DIETARY_CONFIRMATION_NOTICE,
  PRICE_SAFE_RESPONSE,
  type ConciergeAuditEvent,
  type ConciergeEngineResult,
  type ConciergeMessage,
  type ConciergeSession,
  type ConciergeSlots,
} from "@/lib/concierge/types";
import {
  emptyConciergeSlots,
  extractEmail,
  extractPhone,
  inferEventCategory,
  inferRegionFromLocation,
  looksLikeName,
  missingSlotKeys,
  parseGuestCount,
  parseServiceStyle,
  questionForSlot,
  type SlotKey,
} from "@/lib/concierge/slots";
import {
  buildBalancedMenuNote,
  findApprovedDishesByText,
  getApprovedDishById,
  listSelectedDishNames,
  recommendApprovedDishes,
} from "@/lib/concierge/menu-retrieval";

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function pushMessage(
  session: ConciergeSession,
  role: ConciergeMessage["role"],
  content: string,
): ConciergeSession {
  const message: ConciergeMessage = {
    id: newId("msg"),
    role,
    content,
    at: nowIso(),
  };
  return {
    ...session,
    updatedAt: message.at,
    messages: [...session.messages, message],
  };
}

function pushAudit(
  session: ConciergeSession,
  type: ConciergeAuditEvent["type"],
  detail: string,
): ConciergeSession {
  const event: ConciergeAuditEvent = {
    id: newId("audit"),
    at: nowIso(),
    type,
    detail,
  };
  return {
    ...session,
    updatedAt: event.at,
    auditTrail: [...session.auditTrail, event],
  };
}

function mentionsPrice(text: string): boolean {
  // Budget answers like "$25 per person" are not price requests.
  if (/\b(budget|spend|spending|around \$|about \$)\b/i.test(text)) {
    return false;
  }
  return (
    /\b(what(?:'s| is)? the (?:price|cost)|how much (?:does|do|is|are|will)|pricing|send (?:me )?a quote|give me a quote|total (?:price|cost))\b/i.test(
      text,
    ) ||
    (/\b(price|pricing|cost|quote)\b/i.test(text) &&
      !/\b(menu|dish|item)\b/i.test(text))
  );
}

function mentionsAvailability(text: string): boolean {
  return /\b(available|availability|book(ed|ing)?|reserve|confirm(ed|ation)? date|can you do)\b/i.test(
    text,
  );
}

function wantsHuman(text: string): boolean {
  return /\b(human|call me|speak to(?:\s+a)?|chef simbu|real person|talk to (?:a )?person|manager)\b/i.test(
    text,
  );
}

function wantsRecommendations(text: string): boolean {
  return /\b(recommend|suggest|ideas|what should|balanced menu|help me choose|options)\b/i.test(
    text,
  );
}

function parseYesNo(text: string): boolean | null {
  if (/\b(yes|yeah|yep|please|we need|needed|required)\b/i.test(text)) {
    return true;
  }
  if (/\b(no|nope|not needed|none|without)\b/i.test(text)) {
    return false;
  }
  return null;
}

function extractDate(text: string): string {
  const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1]!;
  const us = text.match(
    /\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](20\d{2})\b/,
  );
  if (us) {
    const month = us[1]!.padStart(2, "0");
    const day = us[2]!.padStart(2, "0");
    return `${us[3]}-${month}-${day}`;
  }
  const monthName = text.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(20\d{2}))?\b/i,
  );
  if (monthName) {
    const months: Record<string, string> = {
      january: "01",
      february: "02",
      march: "03",
      april: "04",
      may: "05",
      june: "06",
      july: "07",
      august: "08",
      september: "09",
      october: "10",
      november: "11",
      december: "12",
    };
    const year = monthName[3] ?? String(new Date().getFullYear());
    const day = monthName[2]!.padStart(2, "0");
    return `${year}-${months[monthName[1]!.toLowerCase()]}-${day}`;
  }
  return "";
}

function extractTime(text: string): string {
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = match[2] ?? "00";
  const meridiem = match[3]!.toLowerCase();
  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function updateSlotsFromMessage(
  slots: ConciergeSlots,
  text: string,
): { slots: ConciergeSlots; changed: string[] } {
  const next = { ...slots, selectedDishIds: [...slots.selectedDishIds] };
  const changed: string[] = [];

  if (!next.eventType && text.trim().length > 2 && !mentionsPrice(text)) {
    // Only treat as event type when that slot is the priority later; engine controls when.
  }

  const guestCount = parseGuestCount(text);
  if (guestCount && !next.guestCount) {
    next.guestCount = guestCount;
    changed.push("guestCount");
  }

  const serviceStyle = parseServiceStyle(text);
  if (serviceStyle && !next.serviceStyle) {
    next.serviceStyle = serviceStyle;
    changed.push("serviceStyle");
  }

  const date = extractDate(text);
  if (date && !next.eventDate) {
    next.eventDate = date;
    changed.push("eventDate");
  }

  const time = extractTime(text);
  if (time && !next.eventTime) {
    next.eventTime = time;
    changed.push("eventTime");
  }

  if (/\bseattle area\b|\bgreater seattle\b/i.test(text)) {
    next.serviceRegion = "seattle";
    changed.push("serviceRegion");
  } else if (/\bbay area\b|\bsan francisco bay\b/i.test(text)) {
    next.serviceRegion = "bay_area";
    changed.push("serviceRegion");
  }

  const regionFromLocation = inferRegionFromLocation(text);
  if (regionFromLocation && !next.serviceRegion) {
    next.serviceRegion = regionFromLocation;
    changed.push("serviceRegion");
  }

  if (!next.cityOrZip && !mentionsPrice(text)) {
    const cityMatch = text.match(
      /\b(Bellevue|Redmond|Issaquah|Seattle|Kirkland|Renton|Tacoma|Everett|Fremont|Hayward|San Jose|Palo Alto|San Francisco|Oakland|Sunnyvale|Santa Clara|\d{5})\b/i,
    );
    if (cityMatch) {
      // Preserve common title casing from the known city list.
      const raw = cityMatch[1]!;
      next.cityOrZip = /^\d{5}$/.test(raw)
        ? raw
        : raw
            .split(/\s+/)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(" ");
      changed.push("cityOrZip");
      if (!next.serviceRegion) {
        const inferred = inferRegionFromLocation(next.cityOrZip);
        if (inferred) {
          next.serviceRegion = inferred;
          changed.push("serviceRegion");
        }
      }
    }
  }

  if (
    !next.budgetNotes &&
    /(\$\s?\d|\bper person\b|\bbudget\b|\btotal\b.*\d)/i.test(text)
  ) {
    next.budgetNotes = text.trim();
    changed.push("budgetNotes");
  }

  if (
    !next.cuisinePreference &&
    /\b(indian|indo[- ]?chinese|asian|global|mexican|pasta|mixed|south asian)\b/i.test(
      text,
    )
  ) {
    const cuisine = text.match(
      /\b(indian|indo[- ]?chinese|asian|global|mexican|pasta|mixed menu|south asian|mixed)\b/i,
    );
    if (cuisine) {
      next.cuisinePreference = cuisine[1]!;
      changed.push("cuisinePreference");
    }
  }

  if (
    !next.dietaryRequirements &&
    /\b(allerg|vegan|vegetarian|gluten|nut|dairy|halal|dietary|no pork|no beef)\b/i.test(
      text,
    )
  ) {
    next.dietaryRequirements = text.trim();
    changed.push("dietaryRequirements");
  }

  if (
    /\b(delivery|setup|staff|rental|equipment)\b/i.test(text) &&
    next.deliveryNeeded === null
  ) {
    const yn = parseYesNo(text);
    if (/\bdelivery\b/i.test(text)) next.deliveryNeeded = yn ?? true;
    if (/\bsetup\b/i.test(text)) next.setupNeeded = yn ?? true;
    if (/\bstaff/i.test(text)) next.staffingNeeded = yn ?? true;
    if (/\brental/i.test(text)) next.rentalsNeeded = yn ?? true;
    if (/\bequipment\b/i.test(text)) next.equipmentNeeded = yn ?? true;
    changed.push("operationalNeeds");
  }

  const email = extractEmail(text);
  if (email && !next.customerEmail) {
    next.customerEmail = email;
    changed.push("customerEmail");
  }
  const phone = extractPhone(text);
  if (phone && !next.customerPhone) {
    next.customerPhone = phone;
    changed.push("customerPhone");
  }
  if (!next.customerName && looksLikeName(text) && !guestCount) {
    // Applied only when contact is the active question in the engine.
  }

  const matchedDishes = findApprovedDishesByText(text).filter((item) =>
    text.toLowerCase().includes(item.name.toLowerCase()),
  );
  for (const dish of matchedDishes) {
    if (!next.selectedDishIds.includes(dish.id)) {
      next.selectedDishIds.push(dish.id);
      changed.push(`dish:${dish.id}`);
    }
  }

  return { slots: next, changed };
}

function summarizeEvent(slots: ConciergeSlots): string {
  const dishes = listSelectedDishNames(slots.selectedDishIds);
  const ops = [
    slots.deliveryNeeded ? "delivery" : null,
    slots.setupNeeded ? "setup" : null,
    slots.staffingNeeded ? "staffing" : null,
    slots.rentalsNeeded ? "rentals" : null,
    slots.equipmentNeeded ? "equipment" : null,
  ].filter(Boolean);

  return [
    "Here is the event summary so far (recommendations vs confirmed details are separated below):",
    `• Event: ${slots.eventType || "Not provided"} (${slots.eventCategory || "category pending"})`,
    `• When: ${slots.eventDate || "Date pending"}${slots.eventTime ? ` at ${slots.eventTime}` : ""}`,
    `• Where: ${slots.cityOrZip || "Location pending"} / ${slots.serviceRegion || "region pending"}`,
    `• Guests: ${slots.guestCount ?? "Pending"}`,
    `• Budget notes: ${slots.budgetNotes || "Pending"}`,
    `• Cuisine: ${slots.cuisinePreference || "Pending"}`,
    `• Service style: ${slots.serviceStyle || "Pending"}`,
    `• Dietary: ${slots.dietaryRequirements || "None noted yet"}`,
    `• Operations: ${ops.length ? ops.join(", ") : "Pending"}`,
    `• Confirmed dish selections: ${dishes.length ? dishes.join("; ") : "None yet"}`,
    `• Contact: ${slots.customerName || "Name pending"}, ${slots.customerEmail || "email pending"}, ${slots.customerPhone || "phone pending"}`,
    "",
    "I can prepare this as an inquiry for the iBirdChef team. Availability and pricing are confirmed only after Chef Simbu reviews the event.",
  ].join("\n");
}

function buildQuoteIntake(slots: ConciergeSlots, sessionId: string): QuoteIntake {
  return {
    customerName: slots.customerName,
    customerEmail: slots.customerEmail,
    customerPhone: slots.customerPhone,
    eventDate: slots.eventDate,
    eventLocation: slots.cityOrZip,
    serviceRegion: slots.serviceRegion,
    guestCount: slots.guestCount,
    selectedMenuItems: slots.selectedDishIds.map((id) => {
      const item = getApprovedDishById(id)!;
      return {
        menuItemId: item.id,
        name: item.name,
        marketPriced: item.pricing === "market",
        riskFlags:
          item.pricing === "market"
            ? (["premium_protein"] as Array<
                "seafood" | "lamb" | "goat" | "premium_protein"
              >)
            : undefined,
      };
    }),
    portionOrServiceStyle: slots.serviceStyle || "Not sure yet",
    dietaryRequirements: slots.dietaryRequirements,
    operationalNeeds: emptyOperationalNeeds({
      deliveryNeeded: slots.deliveryNeeded,
      setupNeeded: slots.setupNeeded,
      staffingNeeded: slots.staffingNeeded,
      rentalNeeded: slots.rentalsNeeded,
      equipmentNeeded: slots.equipmentNeeded,
      notes: slots.operationalNotes,
    }),
    inquirySubmissionId: sessionId,
    source: "ai_concierge",
  };
}

export function createConciergeSession(): ConciergeSession {
  const createdAt = nowIso();
  let session: ConciergeSession = {
    id: newId("concierge"),
    createdAt,
    updatedAt: createdAt,
    phase: "welcome",
    slots: emptyConciergeSlots(),
    messages: [],
    recommendedDishIds: [],
    pendingQuestionKeys: ["eventType"],
    auditTrail: [],
  };
  session = pushAudit(session, "session_started", "Concierge session started.");
  session = pushMessage(session, "assistant", CONCIERGE_WELCOME);
  session = pushAudit(session, "assistant_message", CONCIERGE_WELCOME);
  return session;
}

function composeReply(
  lead: string,
  followUp: string,
  extra?: string,
): string {
  return [lead, followUp, extra].filter(Boolean).join("\n\n");
}

export function selectDish(
  session: ConciergeSession,
  dishId: string,
): ConciergeEngineResult {
  const dish = getApprovedDishById(dishId);
  if (!dish) {
    const reply =
      "I can only add dishes from our approved public menu. Please choose one of the listed selections.";
    let next = pushMessage(session, "assistant", reply);
    next = pushAudit(next, "safety_response", "Rejected unknown dish id.");
    return { session: next, assistantReply: reply };
  }
  if (session.slots.selectedDishIds.includes(dishId)) {
    const reply = `${dish.name} is already on your inquiry list. ${buildBalancedMenuNote(session.slots)}`;
    const next = pushMessage(session, "assistant", reply);
    return { session: next, assistantReply: reply };
  }
  const slots = {
    ...session.slots,
    selectedDishIds: [...session.slots.selectedDishIds, dishId],
  };
  let next: ConciergeSession = {
    ...session,
    slots,
    phase: "collecting",
  };
  next = pushAudit(
    next,
    "dish_selected",
    `Added approved dish: ${dish.name}`,
  );
  const reply = composeReply(
    `Added ${dish.name} to your inquiry selections.`,
    buildBalancedMenuNote(slots),
    questionForSlot(missingSlotKeys(slots)[0] ?? "contact", slots),
  );
  next = pushMessage(next, "assistant", reply);
  next = pushAudit(next, "assistant_message", reply);
  return { session: next, assistantReply: reply };
}

export function removeDish(
  session: ConciergeSession,
  dishId: string,
): ConciergeEngineResult {
  const dish = getApprovedDishById(dishId);
  const slots = {
    ...session.slots,
    selectedDishIds: session.slots.selectedDishIds.filter((id) => id !== dishId),
  };
  let next: ConciergeSession = { ...session, slots };
  next = pushAudit(
    next,
    "dish_removed",
    `Removed dish: ${dish?.name ?? dishId}`,
  );
  const reply = composeReply(
    dish ? `Removed ${dish.name} from your selections.` : "Removed that selection.",
    buildBalancedMenuNote(slots),
  );
  next = pushMessage(next, "assistant", reply);
  return { session: next, assistantReply: reply };
}

export function submitConciergeInquiry(
  session: ConciergeSession,
): ConciergeEngineResult {
  const missing = missingSlotKeys(session.slots);
  if (missing.length) {
    const reply = composeReply(
      "I still need a few details before I can prepare the inquiry summary.",
      questionForSlot(missing[0]!, session.slots),
    );
    const next = pushMessage(session, "assistant", reply);
    return { session: next, assistantReply: reply };
  }

  const summary = summarizeEvent(session.slots);
  const inquiryHref = buildInquiryHrefForItemIds(session.slots.selectedDishIds);

  // Internal draft with empty costs — calculation blocked until current costs exist.
  const draft = createQuoteDraft({
    intake: buildQuoteIntake(session.slots, session.id),
    costs: emptyQuoteCostInputs(),
    actor: "ai_concierge",
  });

  let next: ConciergeSession = {
    ...session,
    phase: "submitted",
    inquiryHref,
    quoteDraftId: draft.id,
    quoteStatusLabel: draft.statusLabel,
  };
  next = pushAudit(next, "summary_shown", "Final summary prepared.");
  next = pushAudit(
    next,
    "inquiry_prefill_prepared",
    `Inquiry prefill prepared with ${session.slots.selectedDishIds.length} dishes.`,
  );
  next = pushAudit(
    next,
    "quote_draft_created",
    `${draft.statusLabel}. Customer send remains blocked. Missing costs require manual review.`,
  );

  const reply = composeReply(
    summary,
    `Internal status: ${draft.statusLabel}. I have not sent a quote or confirmed availability. You can continue to the inquiry form to share these details with the iBirdChef team.`,
    "I am an event concierge assistant, not Chef Simbu. A team member can follow up after review.",
  );
  next = pushMessage(next, "assistant", reply);
  next = pushAudit(next, "assistant_message", reply);
  next = {
    ...next,
    inquiryHref: `${inquiryHref}${inquiryHref.includes("?") ? "&" : "?"}conciergeSession=${encodeURIComponent(session.id)}`,
  };
  return { session: next, assistantReply: reply };
}

export function processConciergeMessage(
  session: ConciergeSession,
  rawMessage: string,
): ConciergeEngineResult {
  const text = rawMessage.trim();
  if (!text) {
    return {
      session,
      assistantReply: session.messages.at(-1)?.content ?? CONCIERGE_WELCOME,
    };
  }

  let next = pushMessage(session, "customer", text);
  next = pushAudit(next, "customer_message", text);

  if (wantsHuman(text)) {
    const reply =
      "I can keep collecting details here, and I can also connect you with the iBirdChef team for personal help. I am not Chef Simbu—would you like me to prepare your inquiry summary for human follow-up?";
    next = pushMessage(next, "assistant", reply);
    next = pushAudit(next, "human_handoff_offered", reply);
    return { session: next, assistantReply: reply };
  }

  if (mentionsPrice(text)) {
    const reply = PRICE_SAFE_RESPONSE;
    next = pushMessage(next, "assistant", reply);
    next = pushAudit(next, "safety_response", "Price request safe response.");
    const missing = missingSlotKeys(next.slots);
    if (missing[0]) {
      const follow = questionForSlot(missing[0], next.slots);
      const combined = composeReply(reply, follow);
      next = {
        ...next,
        messages: [
          ...next.messages.slice(0, -1),
          {
            ...next.messages.at(-1)!,
            content: combined,
          },
        ],
      };
      return { session: next, assistantReply: combined };
    }
    return { session: next, assistantReply: reply };
  }

  if (mentionsAvailability(text)) {
    const reply = AVAILABILITY_SAFE_RESPONSE;
    next = pushMessage(next, "assistant", reply);
    next = pushAudit(
      next,
      "safety_response",
      "Availability request safe response.",
    );
    const missing = missingSlotKeys(next.slots);
    const follow = missing[0]
      ? questionForSlot(missing[0], next.slots)
      : "If you would like, I can summarize your event for Chef Simbu’s review.";
    const combined = composeReply(reply, follow);
    next = {
      ...next,
      messages: [
        ...next.messages.slice(0, -1),
        { ...next.messages.at(-1)!, content: combined },
      ],
    };
    return { session: next, assistantReply: combined };
  }

  const activeMissing = missingSlotKeys(next.slots);
  const activeKey: SlotKey | undefined = activeMissing[0];

  // Apply generic extraction first.
  const extracted = updateSlotsFromMessage(next.slots, text);
  let slots = extracted.slots;

  // Slot-targeted capture for the current question.
  if (activeKey === "eventType" && !slots.eventType) {
    slots = {
      ...slots,
      eventType: text,
      eventCategory: inferEventCategory(text),
    };
  } else if (activeKey === "eventDate") {
    slots = {
      ...slots,
      eventDate: slots.eventDate || extractDate(text) || text,
      eventTime: slots.eventTime || extractTime(text),
    };
  } else if (activeKey === "location") {
    if (/\bseattle\b/i.test(text)) slots.serviceRegion = "seattle";
    if (/\bbay area\b/i.test(text)) slots.serviceRegion = "bay_area";
    if (!slots.cityOrZip) slots.cityOrZip = text;
    if (!slots.serviceRegion) {
      slots.serviceRegion = inferRegionFromLocation(text);
    }
  } else if (activeKey === "guestCount" && !slots.guestCount) {
    slots.guestCount = parseGuestCount(text);
  } else if (activeKey === "budgetNotes" && !slots.budgetNotes) {
    slots.budgetNotes = text;
  } else if (activeKey === "cuisinePreference" && !slots.cuisinePreference) {
    slots.cuisinePreference = text;
  } else if (activeKey === "serviceStyle" && !slots.serviceStyle) {
    slots.serviceStyle = parseServiceStyle(text) || "Not sure yet";
  } else if (activeKey === "dietaryRequirements" && !slots.dietaryRequirements) {
    slots.dietaryRequirements = text;
  } else if (activeKey === "operationalNeeds") {
    const need = (keyword: RegExp): boolean | null => {
      if (!keyword.test(text)) return null;
      if (
        new RegExp(
          `\\b(no|without|not needing|don't need|do not need)\\s+[\\w\\s]{0,12}${keyword.source}`,
          "i",
        ).test(text) ||
        new RegExp(
          `${keyword.source}\\s+(not needed|isn't needed|is not needed)`,
          "i",
        ).test(text)
      ) {
        return false;
      }
      return true;
    };
    const delivery = need(/\bdelivery\b/i);
    const setup = need(/\bsetup\b/i);
    const staffing = need(/\bstaff(?:ing|ed)?\b/i);
    const rentals = need(/\brentals?\b/i);
    const equipment = need(/\bequipment\b/i);
    const yn = parseYesNo(text);
    slots = {
      ...slots,
      deliveryNeeded: delivery ?? slots.deliveryNeeded,
      setupNeeded: setup ?? slots.setupNeeded,
      staffingNeeded: staffing ?? slots.staffingNeeded,
      rentalsNeeded: rentals ?? slots.rentalsNeeded,
      equipmentNeeded: equipment ?? slots.equipmentNeeded,
      operationalNotes: text,
    };
    if (
      slots.deliveryNeeded === null &&
      slots.setupNeeded === null &&
      slots.staffingNeeded === null &&
      slots.rentalsNeeded === null &&
      slots.equipmentNeeded === null &&
      yn !== null
    ) {
      slots.deliveryNeeded = yn;
      slots.setupNeeded = yn;
      slots.staffingNeeded = yn;
      slots.rentalsNeeded = false;
      slots.equipmentNeeded = false;
    }
    // Mark answered once any operational flag is set.
    if (
      slots.deliveryNeeded === null &&
      (delivery !== null ||
        setup !== null ||
        staffing !== null ||
        rentals !== null ||
        equipment !== null)
    ) {
      slots.deliveryNeeded = delivery ?? false;
      slots.setupNeeded = setup ?? false;
      slots.staffingNeeded = staffing ?? false;
      slots.rentalsNeeded = rentals ?? false;
      slots.equipmentNeeded = equipment ?? false;
    }
  } else if (activeKey === "contact") {
    const email = extractEmail(text);
    const phone = extractPhone(text);
    if (email) slots.customerEmail = email;
    if (phone) slots.customerPhone = phone;
    if (!slots.customerName) {
      const nameCandidate = text
        .replace(email, " ")
        .replace(phone, " ")
        .replace(/[,|;]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (looksLikeName(nameCandidate)) {
        slots.customerName = nameCandidate;
      } else if (looksLikeName(text)) {
        slots.customerName = text.trim();
      }
    }
  }

  next = {
    ...next,
    slots,
    phase: "collecting",
  };
  if (extracted.changed.length || activeKey) {
    next = pushAudit(
      next,
      "slot_updated",
      `Updated slots from customer message (${activeKey ?? "general"}).`,
    );
  }

  // Recommendations branch
  if (
    wantsRecommendations(text) ||
    (activeKey === "selectedDishes" &&
      /\b(recommend|suggest|yes|please|balanced)\b/i.test(text))
  ) {
    const suggestions = recommendApprovedDishes(slots, 6);
    next = {
      ...next,
      recommendedDishIds: suggestions.map((item) => item.id),
      phase: "recommending",
      lastRecommendationsNote:
        "These are approved-menu recommendations only—not confirmed selections until you add them.",
    };
    next = pushAudit(
      next,
      "menu_recommended",
      `Recommended ${suggestions.length} approved dishes.`,
    );
    const lines = suggestions
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} — ${item.categoryLabel} (${item.pricingLabel})`,
      )
      .join("\n");
    const reply = composeReply(
      "Here are approved-menu recommendations for a balanced plan. I will not replace any dishes you already chose unless you ask.",
      lines || "I could not find additional matches in the approved menu for that preference.",
      `${DIETARY_CONFIRMATION_NOTICE} Would you like to add any of these, or tell me specific dishes to include?`,
    );
    next = pushMessage(next, "assistant", reply);
    next = pushAudit(next, "assistant_message", reply);
    return { session: next, assistantReply: reply };
  }

  if (/\b(summary|looks good|submit|ready|prepare inquiry|that's all)\b/i.test(text)) {
    return submitConciergeInquiry(next);
  }

  const missing = missingSlotKeys(slots);
  if (!missing.length) {
    next = {
      ...next,
      phase: "summary",
    };
    const reply = composeReply(
      summarizeEvent(slots),
      "If this looks right, reply “prepare inquiry” and I will create the summary for follow-up. I will not send a quote or confirm a booking.",
    );
    next = pushMessage(next, "assistant", reply);
    next = pushAudit(next, "summary_shown", "Event summary shown.");
    return { session: next, assistantReply: reply };
  }

  let lead = "Thanks—I've noted that.";
  let followUp = questionForSlot(missing[0]!, slots);

  if (
    slots.guestCount &&
    slots.cityOrZip &&
    !slots.serviceStyle &&
    missing.includes("eventDate") &&
    missing.includes("budgetNotes")
  ) {
    lead = `I'd be happy to help plan it. For ${slots.guestCount} guests in ${slots.cityOrZip}, would you prefer individually packaged meals or a buffet?`;
    followUp =
      "Also, what date are you considering and approximately how much would you like to spend per person?";
  } else if (
    missing[0] === "eventDate" &&
    missing.includes("budgetNotes") &&
    slots.serviceStyle
  ) {
    lead = "Thanks—I've noted that.";
    followUp =
      "What date are you considering, and approximately how much would you like to spend per person?";
  } else if (activeKey === "dietaryRequirements" || missing[0] === "dietaryRequirements") {
    lead = `Understood. ${DIETARY_CONFIRMATION_NOTICE}`;
  } else if (missing[0] === "selectedDishes" && slots.selectedDishIds.length) {
    lead = buildBalancedMenuNote(slots);
  }

  const reply = composeReply(lead, followUp);
  next = {
    ...next,
    pendingQuestionKeys: missing,
  };
  next = pushMessage(next, "assistant", reply);
  next = pushAudit(next, "assistant_message", reply);
  return { session: next, assistantReply: reply };
}

export function getRecommendationCards(session: ConciergeSession) {
  if (!session.recommendedDishIds.length) return [];
  return recommendApprovedDishes(session.slots, 6).filter((item) =>
    session.recommendedDishIds.includes(item.id),
  );
}

export function categoryLabel(id: string): string {
  return PUBLIC_MENU_CATEGORY_LABELS[
    id as keyof typeof PUBLIC_MENU_CATEGORY_LABELS
  ] ?? id;
}
