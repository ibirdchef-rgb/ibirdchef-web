import { allStandardCities, regions } from "@/lib/regions";

export const siteConfig = {
  name: "iBirdChef",
  tagline: "South Asian Cuisine Catering",
  description:
    "Premium catering and private-chef experiences in Greater Seattle and the San Francisco Bay Area. South Asian menus for corporate workplaces, private dinners, and family celebrations.",
  chef: "Chef Simbu",
  phoneDisplay: "(425) 600-6692",
  phoneHref: "tel:+14256006692",
  emailDisplay: "order@ibirdchef.com",
  emailHref: "mailto:order@ibirdchef.com",
  keywords: [
    "Seattle catering",
    "Eastside catering",
    "Bellevue catering",
    "Redmond catering",
    "Issaquah catering",
    "San Francisco Bay Area catering",
    "San Francisco catering",
    "Fremont catering",
    "San Jose catering",
    "Palo Alto catering",
    "private chef",
    "corporate catering",
    "South Asian catering",
    "iBirdChef",
    "Chef Simbu",
  ],
  serviceAreas: allStandardCities(),
  regionLabels: [regions.seattle.label, regions.bay_area.label] as const,
  services: [
    "Private Chef Dining",
    "Corporate Catering",
    "Special Events",
  ],
} as const;

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
