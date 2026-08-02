/**
 * Shared event-inquiry schema for the website, AI chat (Task A), Clow, and
 * future iBirdOS costing handoff. UI and adapters should depend on this module
 * rather than inventing parallel field shapes.
 */

import {
  isServiceRegion,
  type ServiceRegion,
} from "@/lib/regions";

export const EVENT_CATEGORIES = [
  "corporate",
  "personal_family",
  "private_chef",
  "other",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  corporate: "Corporate catering",
  personal_family: "Personal / family event",
  private_chef: "Private chef dining",
  other: "Other",
};

export const PRIVATE_FAMILY_EVENT_TYPES = [
  "Birthday",
  "Children's birthday",
  "Anniversary",
  "Baby shower",
  "Graduation",
  "Housewarming",
  "Family / holiday gathering",
  "Religious / cultural celebration",
  "Private dinner",
  "Live cooking experience",
  "Other personal / family event",
] as const;

export const CORPORATE_EVENT_TYPES = [
  "Workplace lunch",
  "Breakfast / morning meeting",
  "Reception / mixer",
  "Executive dining",
  "Recurring workplace meals",
  "Other corporate event",
] as const;

export const SERVICE_TYPES = [
  "Private Chef Dining",
  "Corporate Catering",
  "Private & Family Events",
  "Special Events",
  "Other",
] as const;

export const SERVICE_STYLES = [
  "Buffet",
  "Plated",
  "Family style",
  "Boxed meals",
  "Live cooking",
  "Drop-off catering",
  "Not sure yet",
] as const;

export const BUDGET_RANGES = [
  "Under $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
  "Not sure yet",
] as const;

export const LEAD_SOURCES = [
  "Website",
  "Google search",
  "Instagram",
  "Facebook",
  "WhatsApp",
  "Referral",
  "Repeat customer",
  "Other",
] as const;

export const PAGE_SOURCES = [
  "homepage",
  "private-events",
  "seattle",
  "bay-area",
  "menu-chat",
  "other",
] as const;

export type PageSource = (typeof PAGE_SOURCES)[number];

/** Canonical inquiry collected by website forms and AI chat Task A. */
export type EventInquiry = {
  name: string;
  email: string;
  phone: string;
  serviceRegion: ServiceRegion | "";
  eventCategory: EventCategory | "";
  eventType: string;
  eventDate: string;
  eventTime: string;
  eventCity: string;
  venueOrZip: string;
  /** Combined city + venue/ZIP for legacy Clow/email compatibility. */
  eventLocation: string;
  guestCount: string;
  cuisinePreference: string;
  serviceStyle: string;
  serviceType: string;
  estimatedBudget: string;
  dietaryNeeds: string;
  leadSource: string;
  contactConsent: boolean;
  smsConsent: boolean;
  message: string;
  pageSource: PageSource | "";
};

export const EVENT_INQUIRY_MAX_LENGTH = {
  name: 120,
  email: 254,
  phone: 40,
  serviceRegion: 40,
  eventCategory: 40,
  eventType: 120,
  eventDate: 40,
  eventTime: 40,
  eventCity: 120,
  venueOrZip: 120,
  eventLocation: 240,
  guestCount: 20,
  cuisinePreference: 200,
  serviceStyle: 80,
  serviceType: 80,
  estimatedBudget: 80,
  dietaryNeeds: 500,
  leadSource: 80,
  message: 4000,
  pageSource: 40,
} as const;

export type EventInquiryValidationResult =
  | { ok: true; inquiry: EventInquiry }
  | { ok: false; error: string };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "true" ||
      normalized === "on" ||
      normalized === "1" ||
      normalized === "yes"
    );
  }
  return false;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function composeEventLocation(city: string, venueOrZip: string): string {
  const parts = [city.trim(), venueOrZip.trim()].filter(Boolean);
  return parts.join(" · ");
}

export function emptyEventInquiry(
  defaults?: Partial<EventInquiry>,
): EventInquiry {
  return {
    name: "",
    email: "",
    phone: "",
    serviceRegion: "",
    eventCategory: "",
    eventType: "",
    eventDate: "",
    eventTime: "",
    eventCity: "",
    venueOrZip: "",
    eventLocation: "",
    guestCount: "",
    cuisinePreference: "",
    serviceStyle: "",
    serviceType: "",
    estimatedBudget: "",
    dietaryNeeds: "",
    leadSource: "",
    contactConsent: false,
    smsConsent: false,
    message: "",
    pageSource: "",
    ...defaults,
  };
}

export function parseEventInquiry(raw: unknown): EventInquiry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const eventCategory = asTrimmedString(data.eventCategory);
  const pageSource = asTrimmedString(data.pageSource);
  const serviceRegionRaw = asTrimmedString(data.serviceRegion);
  const eventCity = asTrimmedString(data.eventCity);
  const venueOrZip = asTrimmedString(data.venueOrZip);
  const legacyLocation = asTrimmedString(data.eventLocation);
  const resolvedCity = eventCity || legacyLocation;
  const eventLocation =
    asTrimmedString(data.eventLocation) ||
    composeEventLocation(resolvedCity, venueOrZip);

  return {
    name: asTrimmedString(data.name),
    email: asTrimmedString(data.email),
    phone: asTrimmedString(data.phone),
    serviceRegion: isServiceRegion(serviceRegionRaw) ? serviceRegionRaw : "",
    eventCategory: (EVENT_CATEGORIES as readonly string[]).includes(eventCategory)
      ? (eventCategory as EventCategory)
      : (eventCategory as EventCategory | ""),
    eventType: asTrimmedString(data.eventType),
    eventDate: asTrimmedString(data.eventDate),
    eventTime: asTrimmedString(data.eventTime),
    eventCity: resolvedCity,
    venueOrZip,
    eventLocation,
    guestCount: asTrimmedString(data.guestCount),
    cuisinePreference: asTrimmedString(data.cuisinePreference),
    serviceStyle: asTrimmedString(data.serviceStyle),
    serviceType: asTrimmedString(data.serviceType),
    estimatedBudget: asTrimmedString(data.estimatedBudget),
    dietaryNeeds: asTrimmedString(data.dietaryNeeds),
    leadSource: asTrimmedString(data.leadSource),
    contactConsent: asBoolean(data.contactConsent),
    smsConsent: asBoolean(data.smsConsent),
    message: asTrimmedString(data.message),
    pageSource: (PAGE_SOURCES as readonly string[]).includes(pageSource)
      ? (pageSource as PageSource)
      : (pageSource as PageSource | ""),
  };
}

export function validateEventInquiry(
  inquiry: EventInquiry,
): EventInquiryValidationResult {
  const required: Array<keyof EventInquiry> = [
    "name",
    "email",
    "phone",
    "serviceRegion",
    "eventCategory",
    "eventType",
    "eventDate",
    "eventCity",
    "venueOrZip",
    "guestCount",
    "serviceStyle",
    "serviceType",
    "message",
  ];

  for (const field of required) {
    const value = inquiry[field];
    if (typeof value === "string" && !value) {
      return { ok: false, error: `Missing required field: ${field}` };
    }
  }

  if (!inquiry.contactConsent) {
    return {
      ok: false,
      error: "Please confirm we may contact you about this inquiry.",
    };
  }

  if (!isValidEmail(inquiry.email)) {
    return { ok: false, error: "Please provide a valid email address." };
  }

  if (!isServiceRegion(inquiry.serviceRegion)) {
    return { ok: false, error: "Please select a service region." };
  }

  if (
    inquiry.eventCategory &&
    !(EVENT_CATEGORIES as readonly string[]).includes(inquiry.eventCategory)
  ) {
    return { ok: false, error: "Please select a valid event category." };
  }

  const guestCount = Number(inquiry.guestCount);
  if (!Number.isFinite(guestCount) || guestCount < 1) {
    return { ok: false, error: "Guest count must be a positive number." };
  }

  for (const [key, max] of Object.entries(EVENT_INQUIRY_MAX_LENGTH) as Array<
    [keyof typeof EVENT_INQUIRY_MAX_LENGTH, number]
  >) {
    const value = inquiry[key];
    if (typeof value === "string" && value.length > max) {
      return { ok: false, error: `${key} is too long.` };
    }
  }

  return { ok: true, inquiry };
}

export function eventCategoryLabel(category: EventCategory | ""): string {
  if (!category) {
    return "Not provided";
  }
  return EVENT_CATEGORY_LABELS[category] ?? category;
}
