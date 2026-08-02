import type { EventInquiry } from "@/lib/event-inquiry";

/**
 * iBirdOS Engine adapter — profitability and operations handoff.
 *
 * This pass prepares a typed payload only. Do not call imaginary endpoints or
 * hard-code credentials. Real forwarding waits on approved iBirdOS integration.
 */

export type IBirdOsCostingRequest = {
  submissionId: string;
  source: "ibirdchef-web";
  workflowStage: "pending_costing";
  event: {
    category: EventInquiry["eventCategory"];
    type: string;
    date: string;
    time: string;
    region: EventInquiry["serviceRegion"];
    city: string;
    venueOrZip: string;
    location: string;
    guestCount: string;
    cuisinePreference: string;
    serviceStyle: string;
    serviceType: string;
    dietaryNeeds: string;
    estimatedBudget: string;
    notes: string;
  };
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  marketing: {
    leadSource: string;
    pageSource: EventInquiry["pageSource"];
    contactConsent: boolean;
    smsConsent: boolean;
  };
  /**
   * Cost dimensions iBirdOS is expected to evaluate. Values are intentionally
   * omitted here — the engine calculates them; the website must not invent them.
   */
  costingChecklist: Array<
    | "ingredients"
    | "labor"
    | "packaging"
    | "delivery"
    | "equipment"
    | "rental"
    | "service"
    | "tax"
    | "overhead"
  >;
};

export type IBirdOsForwardResult =
  | { ok: true; status: "prepared" }
  | { ok: false; category: "not_configured" };

export function buildIBirdOsCostingRequest(
  inquiry: EventInquiry,
  submissionId: string,
): IBirdOsCostingRequest {
  return {
    submissionId,
    source: "ibirdchef-web",
    workflowStage: "pending_costing",
    event: {
      category: inquiry.eventCategory,
      type: inquiry.eventType,
      date: inquiry.eventDate,
      time: inquiry.eventTime,
      region: inquiry.serviceRegion,
      city: inquiry.eventCity,
      venueOrZip: inquiry.venueOrZip,
      location: inquiry.eventLocation,
      guestCount: inquiry.guestCount,
      cuisinePreference: inquiry.cuisinePreference,
      serviceStyle: inquiry.serviceStyle,
      serviceType: inquiry.serviceType,
      dietaryNeeds: inquiry.dietaryNeeds,
      estimatedBudget: inquiry.estimatedBudget,
      notes: inquiry.message,
    },
    contact: {
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
    },
    marketing: {
      leadSource: inquiry.leadSource,
      pageSource: inquiry.pageSource,
      contactConsent: inquiry.contactConsent,
      smsConsent: inquiry.smsConsent,
    },
    costingChecklist: [
      "ingredients",
      "labor",
      "packaging",
      "delivery",
      "equipment",
      "rental",
      "service",
      "tax",
      "overhead",
    ],
  };
}

/**
 * Placeholder until an approved iBirdOS intake URL/secret are configured.
 * Preserves the current email + Clow path as the working submission flow.
 */
export function forwardInquiryToIBirdOs(input: {
  payload: IBirdOsCostingRequest;
}): IBirdOsForwardResult {
  void input.payload;
  return { ok: false, category: "not_configured" };
}
