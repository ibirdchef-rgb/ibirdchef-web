import type { PublicMenuCategoryId } from "@/lib/curated-menu";
import type { EventCategory } from "@/lib/event-inquiry";
import type { ServiceRegion } from "@/lib/regions";
import type { QuoteDraft } from "@/lib/quote-draft";

export const CONCIERGE_WELCOME =
  "Welcome to iBirdChef! I can help you plan a menu for your event. What type of event are you organizing?";

export const PRICE_SAFE_RESPONSE =
  "Pricing depends on the final menu, guest count, service requirements and current ingredient costs. I can prepare your selections for Chef Simbu to review and approve.";

export const AVAILABILITY_SAFE_RESPONSE =
  "I can record your requested date, but availability is confirmed only after Chef Simbu reviews the event.";

export const DIETARY_CONFIRMATION_NOTICE =
  "Dietary and allergen requirements are recorded for planning and require culinary confirmation before service.";

export { CONTACT_PRIVACY_NOTICE } from "@/lib/concierge/contact";

export type ConciergeTurnRole = "assistant" | "customer" | "system";

export type ConciergeMessage = {
  id: string;
  role: ConciergeTurnRole;
  content: string;
  at: string;
};

export type ConciergeServicePreference =
  | "Buffet"
  | "Boxed meals"
  | "Drop-off catering"
  | "Live cooking"
  | "Plated"
  | "Family style"
  | "Not sure yet"
  | "";

export type ConciergeSlots = {
  eventType: string;
  eventCategory: EventCategory | "";
  eventDate: string;
  eventTime: string;
  cityOrZip: string;
  serviceRegion: ServiceRegion | "";
  guestCount: number | null;
  budgetNotes: string;
  cuisinePreference: string;
  serviceStyle: ConciergeServicePreference;
  dietaryRequirements: string;
  deliveryNeeded: boolean | null;
  setupNeeded: boolean | null;
  staffingNeeded: boolean | null;
  rentalsNeeded: boolean | null;
  equipmentNeeded: boolean | null;
  operationalNotes: string;
  selectedDishIds: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  phoneSkipped: boolean;
};

export type ConciergePhase =
  | "welcome"
  | "collecting"
  | "recommending"
  | "summary"
  | "ready_to_submit"
  | "submitted";

export type ConciergeAuditEvent = {
  id: string;
  at: string;
  type:
    | "session_started"
    | "customer_message"
    | "assistant_message"
    | "slot_updated"
    | "menu_recommended"
    | "dish_selected"
    | "dish_removed"
    | "summary_shown"
    | "inquiry_prefill_prepared"
    | "quote_draft_created"
    | "safety_response"
    | "human_handoff_offered";
  detail: string;
};

export type ConciergeSession = {
  id: string;
  createdAt: string;
  updatedAt: string;
  phase: ConciergePhase;
  slots: ConciergeSlots;
  messages: ConciergeMessage[];
  recommendedDishIds: string[];
  pendingQuestionKeys: string[];
  auditTrail: ConciergeAuditEvent[];
  quoteDraftId?: QuoteDraft["id"];
  quoteStatusLabel?: QuoteDraft["statusLabel"];
  inquiryHref?: string;
  lastRecommendationsNote?: string;
};

export type ConciergeEngineResult = {
  session: ConciergeSession;
  assistantReply: string;
};

export type ConciergeMenuSuggestion = {
  id: string;
  name: string;
  categoryId: PublicMenuCategoryId;
  categoryLabel: string;
  pricingLabel: string;
  reason: string;
};
