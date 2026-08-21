export const paths = {
  home: "/",
  menu: "/menu",
  services: "/services",
  contact: "/contact",
  seattle: "/seattle",
  bellevue: "/bellevue",
  bayArea: "/bay-area",
  privateEvents: "/private-events",
  privacy: "/privacy",
} as const;

export function contactHref(intent?: "tasting" | "quote"): string {
  if (intent === "tasting") {
    return `${paths.contact}?intent=tasting`;
  }
  if (intent === "quote") {
    return `${paths.contact}?intent=quote`;
  }
  return paths.contact;
}

export const TASTING_INQUIRY_MESSAGE =
  "I would like to book a tasting for a potential catering event. Please follow up to schedule.";

export const QUOTE_INQUIRY_MESSAGE =
  "I would like a catering quote for an upcoming office meal, event, or live station.";
