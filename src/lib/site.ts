export const siteConfig = {
  name: "iBirdChef",
  tagline: "South Asian Cuisine Catering",
  description:
    "iBirdChef provides private chef dining, corporate catering, and special-event culinary services across Seattle, the Eastside, and the San Francisco Bay Area. South Asian catering for private gatherings and workplaces.",
  chef: "Chef Simbu",
  phoneDisplay: "(425) 600-6692",
  phoneHref: "tel:+14256006692",
  emailDisplay: "order@ibirdchef.com",
  emailHref: "mailto:order@ibirdchef.com",
  keywords: [
    "Seattle catering",
    "Eastside catering",
    "San Francisco Bay Area catering",
    "private chef",
    "corporate catering",
    "South Asian catering",
    "Bellevue catering",
    "Redmond catering",
    "Bay Area private chef",
    "iBirdChef",
    "Chef Simbu",
  ],
  serviceAreas: [
    "Seattle",
    "Bellevue",
    "Redmond",
    "Sammamish",
    "Issaquah",
    "Eastside Communities",
    "San Francisco Bay Area",
    "San Jose",
    "Oakland",
    "Fremont",
  ],
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
