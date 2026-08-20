import { allStandardCities, regions } from "@/lib/regions";

export type OperatingLocation = {
  id: "bellevue" | "santa-clara";
  region: "seattle" | "bay_area";
  label: string;
  schemaName: string;
  streetAddress: string;
  addressLocality: string;
  addressRegion: string;
  postalCode: string;
  addressCountry: "US";
  lines: readonly string[];
};

export const siteConfig = {
  name: "iBirdChef",
  positioning:
    "iBirdChef — Corporate Catering, Office Meals, Private Events & Live Stations",
  tagline: "Corporate Catering, Office Meals, Private Events & Live Stations",
  shortTagline: "Corporate Catering & Events",
  description:
    "Corporate catering, office meals, private events, cultural menus and live culinary stations in Seattle, Bellevue, Redmond, the Eastside, and the San Francisco Bay Area.",
  chef: "Chef Simbu",
  phoneDisplay: "(425) 600-6692",
  phoneHref: "tel:+14256006692",
  emailDisplay: "order@ibirdchef.com",
  emailHref: "mailto:order@ibirdchef.com",
  mealsDeliveredNote:
    "iBirdChef has supported delivery of 5,000+ meals for Bay Area corporate offices and events.",
  vendorStatus:
    "Approved vendor for Aramark and Sodexo. No endorsement implied.",
  locationDisclaimer:
    "These are operating and business locations for catering operations, not walk-in restaurants.",
  locations: [
    {
      id: "bellevue",
      region: "seattle",
      label: "Washington",
      schemaName: "iBirdChef Bellevue operating location",
      streetAddress: "14510 NE 20th St",
      addressLocality: "Bellevue",
      addressRegion: "WA",
      postalCode: "98007",
      addressCountry: "US",
      lines: ["14510 NE 20th St", "Bellevue, WA 98007"],
    },
    {
      id: "santa-clara",
      region: "bay_area",
      label: "California",
      schemaName: "iBirdChef Santa Clara operating location",
      streetAddress: "2181 Laurelwood Rd",
      addressLocality: "Santa Clara",
      addressRegion: "CA",
      postalCode: "",
      addressCountry: "US",
      lines: ["2181 Laurelwood Rd", "Santa Clara, CA"],
    },
  ] as const satisfies readonly OperatingLocation[],
  serviceAreas: allStandardCities(),
  regionLabels: [regions.seattle.label, regions.bay_area.label] as const,
  services: [
    "Corporate Catering",
    "Office Meals",
    "Tray and Drop-Off Catering",
    "Buffet Catering",
    "Cultural Catering",
    "Live Stations",
    "Private Events",
  ],
} as const;

export function formatLocation(location: OperatingLocation): string {
  return location.lines.join(", ");
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
