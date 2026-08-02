export const SERVICE_REGIONS = ["seattle", "bay_area"] as const;

export type ServiceRegion = (typeof SERVICE_REGIONS)[number];

export type RegionConfig = {
  id: ServiceRegion;
  label: string;
  shortLabel: string;
  headline: string;
  summary: string;
  cities: readonly string[];
  surroundingLabel: string;
  accentHint: "pacific" | "california";
  path: `/${string}`;
  seoTitle: string;
  seoDescription: string;
  localPoints: readonly { title: string; description: string }[];
};

export const REGION_STORAGE_KEY = "ibirdchef-service-region";

export const regions: Record<ServiceRegion, RegionConfig> = {
  seattle: {
    id: "seattle",
    label: "Greater Seattle",
    shortLabel: "Seattle Area",
    headline: "Premium catering for Greater Seattle workplaces and celebrations.",
    summary:
      "From downtown Seattle offices to Eastside gatherings in Bellevue, Redmond, and Issaquah, menus are planned for the way your guests actually meet.",
    cities: ["Seattle", "Bellevue", "Redmond", "Issaquah"],
    surroundingLabel: "and surrounding communities",
    accentHint: "pacific",
    path: "/seattle",
    seoTitle: "Seattle & Eastside Catering and Private Chef",
    seoDescription:
      "iBirdChef provides South Asian corporate catering and private-chef dining across Greater Seattle, including Seattle, Bellevue, Redmond, Issaquah, and nearby communities.",
    localPoints: [
      {
        title: "Eastside corporate hospitality",
        description:
          "Reliable breakfast, lunch, and reception service for Bellevue, Redmond, and Seattle workplaces—planned around production timing and dietary needs.",
      },
      {
        title: "Private dinners with PNW pace",
        description:
          "In-home and intimate gatherings shaped for Seattle evenings, family celebrations, and thoughtfully paced private-chef service.",
      },
      {
        title: "Custom quotes after review",
        description:
          "Regional delivery, staffing, and production details are reviewed before a chef-approved quote—never assumed from another market.",
      },
    ],
  },
  bay_area: {
    id: "bay_area",
    label: "San Francisco Bay Area",
    shortLabel: "Bay Area",
    headline: "Premium catering for Bay Area offices, homes, and celebrations.",
    summary:
      "South Asian menus for San Francisco, Fremont, Hayward, San Jose, Palo Alto, and surrounding communities—planned for multicultural tables and contemporary events.",
    cities: ["San Francisco", "Fremont", "Hayward", "San Jose", "Palo Alto"],
    surroundingLabel: "and surrounding communities",
    accentHint: "california",
    path: "/bay-area",
    seoTitle: "Bay Area Catering and Private Chef",
    seoDescription:
      "iBirdChef provides South Asian corporate catering and private-chef dining across the San Francisco Bay Area, including San Francisco, Fremont, Hayward, San Jose, Palo Alto, and nearby communities.",
    localPoints: [
      {
        title: "Peninsula and South Bay gatherings",
        description:
          "Menus for Palo Alto, San Jose, and surrounding workplaces and homes—balanced for guest preferences and event flow.",
      },
      {
        title: "East Bay and San Francisco service",
        description:
          "Corporate lunches, receptions, and private celebrations planned for Fremont, Hayward, San Francisco, and nearby communities.",
      },
      {
        title: "Custom quotes after review",
        description:
          "Bay Area logistics and production requirements are reviewed before a chef-approved quote—never copied from another region’s assumptions.",
      },
    ],
  },
};

export const DUAL_MARKET_HEADLINE =
  "Premium Catering & Private Chef Experiences in Greater Seattle and the San Francisco Bay Area";

export const OUTSIDE_AREA_MESSAGE =
  "Your location may still be available. Submit your event details for confirmation.";

export function isServiceRegion(value: unknown): value is ServiceRegion {
  return value === "seattle" || value === "bay_area";
}

export function regionLabel(region: ServiceRegion | "" | null): string {
  if (!region || !isServiceRegion(region)) {
    return "Not selected";
  }
  return regions[region].shortLabel;
}

export function isStandardCity(
  region: ServiceRegion | "",
  city: string,
): boolean {
  if (!region || !isServiceRegion(region)) {
    return false;
  }
  const normalized = city.trim().toLowerCase();
  if (!normalized) {
    return false;
  }
  return regions[region].cities.some(
    (item) => item.toLowerCase() === normalized,
  );
}

export function allStandardCities(): string[] {
  return [...regions.seattle.cities, ...regions.bay_area.cities];
}
