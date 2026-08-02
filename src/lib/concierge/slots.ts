import type { EventCategory } from "@/lib/event-inquiry";
import type { ServiceRegion } from "@/lib/regions";
import type { ConciergeServicePreference, ConciergeSlots } from "@/lib/concierge/types";

export function emptyConciergeSlots(
  overrides?: Partial<ConciergeSlots>,
): ConciergeSlots {
  return {
    eventType: "",
    eventCategory: "",
    eventDate: "",
    eventTime: "",
    cityOrZip: "",
    serviceRegion: "",
    guestCount: null,
    budgetNotes: "",
    cuisinePreference: "",
    serviceStyle: "",
    dietaryRequirements: "",
    deliveryNeeded: null,
    setupNeeded: null,
    staffingNeeded: null,
    rentalsNeeded: null,
    equipmentNeeded: null,
    operationalNotes: "",
    selectedDishIds: [],
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    ...overrides,
  };
}

const CORPORATE_HINTS =
  /\b(office|corporate|workplace|team lunch|meeting|company|staff lunch|all hands)\b/i;
const PRIVATE_HINTS =
  /\b(birthday|anniversary|baby shower|graduation|housewarming|wedding|family|private dinner|holiday|diwali|eid|christmas)\b/i;
const PRIVATE_CHEF_HINTS =
  /\b(private chef|in[- ]home|chef at home|intimate dinner)\b/i;

export function inferEventCategory(eventType: string): EventCategory | "" {
  if (PRIVATE_CHEF_HINTS.test(eventType)) return "private_chef";
  if (CORPORATE_HINTS.test(eventType)) return "corporate";
  if (PRIVATE_HINTS.test(eventType)) return "personal_family";
  return eventType.trim() ? "other" : "";
}

export function inferRegionFromLocation(
  cityOrZip: string,
): ServiceRegion | "" {
  const text = cityOrZip.toLowerCase();
  if (
    /\b(seattle|bellevue|redmond|issaquah|kirkland|renton|tacoma|everett|9800[4-9]|9805[2-9]|9810[1-9]|9811[0-9]|9812[1-9])\b/.test(
      text,
    )
  ) {
    return "seattle";
  }
  if (
    /\b(san francisco|fremont|hayward|san jose|palo alto|oakland|sunnyvale|santa clara|bay area|940|941|945|950|951)\b/.test(
      text,
    )
  ) {
    return "bay_area";
  }
  return "";
}

export function parseGuestCount(text: string): number | null {
  const match = text.match(
    /\b(\d{1,4})\s*(?:people|guests|pax|persons)?\b/i,
  );
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function parseServiceStyle(
  text: string,
): ConciergeServicePreference | "" {
  const t = text.toLowerCase();
  if (/\bbox(ed)?\b|\bindividual(ly)? packaged\b/.test(t)) return "Boxed meals";
  if (/\blive\b|\bdosa corner\b|\bbbq corner\b|\bchaat\b/.test(t)) {
    return "Live cooking";
  }
  if (/\bbuffet\b/.test(t)) return "Buffet";
  if (/\bdrop[- ]?off\b|\bdelivery only\b/.test(t)) return "Drop-off catering";
  if (/\bplated\b/.test(t)) return "Plated";
  if (/\bfamily style\b/.test(t)) return "Family style";
  if (/\bnot sure\b|\bundecided\b/.test(t)) return "Not sure yet";
  return "";
}

export function extractEmail(text: string): string {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? "";
}

export function extractPhone(text: string): string {
  const match = text.match(
    /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/,
  );
  return match?.[0] ?? "";
}

export function looksLikeName(text: string): boolean {
  const cleaned = text.trim();
  if (!cleaned || cleaned.length > 60) return false;
  if (extractEmail(cleaned) || extractPhone(cleaned)) return false;
  if (/\d/.test(cleaned)) return false;
  return /^[A-Za-z][A-Za-z\s.'-]{1,58}$/.test(cleaned);
}

export type SlotKey =
  | "eventType"
  | "eventDate"
  | "location"
  | "guestCount"
  | "budgetNotes"
  | "cuisinePreference"
  | "serviceStyle"
  | "dietaryRequirements"
  | "operationalNeeds"
  | "selectedDishes"
  | "contact";

export function missingSlotKeys(slots: ConciergeSlots): SlotKey[] {
  const missing: SlotKey[] = [];
  // Order favors the most useful next question for qualification.
  if (!slots.eventType) missing.push("eventType");
  if (!slots.guestCount) missing.push("guestCount");
  if (!slots.cityOrZip || !slots.serviceRegion) missing.push("location");
  if (!slots.serviceStyle) missing.push("serviceStyle");
  if (!slots.eventDate) missing.push("eventDate");
  if (!slots.budgetNotes) missing.push("budgetNotes");
  if (!slots.cuisinePreference) missing.push("cuisinePreference");
  if (!slots.dietaryRequirements) missing.push("dietaryRequirements");
  if (
    slots.deliveryNeeded === null &&
    slots.setupNeeded === null &&
    slots.staffingNeeded === null &&
    slots.rentalsNeeded === null &&
    slots.equipmentNeeded === null
  ) {
    missing.push("operationalNeeds");
  }
  if (slots.selectedDishIds.length === 0) missing.push("selectedDishes");
  if (!slots.customerName || !slots.customerEmail || !slots.customerPhone) {
    missing.push("contact");
  }
  return missing;
}

export function questionForSlot(key: SlotKey, slots: ConciergeSlots): string {
  switch (key) {
    case "eventType":
      return "What are you celebrating or organizing?";
    case "eventDate":
      return "What date are you considering, and what serving time works best?";
    case "location":
      return slots.cityOrZip && !slots.serviceRegion
        ? "Should I plan this for the Seattle Area or the Bay Area?"
        : "Where will the event be held? Please share the city or ZIP code, and whether it is Seattle Area or Bay Area.";
    case "guestCount":
      return "About how many guests should we plan for?";
    case "budgetNotes":
      return "Do you have an estimated budget per person, or a total budget range?";
    case "cuisinePreference":
      return "Which cuisine direction should I prioritize—Indian, Indo-Chinese, Asian favorites, global options, or a mixed menu?";
    case "serviceStyle":
      return "Would you prefer buffet, individually packaged meals, drop-off delivery, staffed service, or a live cooking station?";
    case "dietaryRequirements":
      return "Please share any dietary requirements or allergies we should plan around. Our culinary team confirms ingredients before service.";
    case "operationalNeeds":
      return "Will you need delivery, on-site setup, staffing, rentals, or equipment support?";
    case "selectedDishes":
      return "I can suggest a balanced menu from our menu. Would you like recommendations for entrées, sides, rice, breads, and dessert—or do you already have dishes in mind?";
    case "contact":
      if (!slots.customerName) {
        return "What name should Chef Simbu’s team use for follow-up?";
      }
      if (!slots.customerEmail) {
        return "What email should we use for the inquiry follow-up?";
      }
      return "What phone number is best for coordination?";
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}
