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
    headline: "Corporate catering for Seattle, Bellevue, Redmond and the Eastside.",
    summary:
      "Office lunches, box meals, buffets, cultural menus, private events and live culinary stations across Seattle, Bellevue, Redmond and surrounding Eastside communities.",
    cities: ["Seattle", "Bellevue", "Redmond", "Issaquah"],
    surroundingLabel: "and surrounding Eastside communities",
    accentHint: "pacific",
    path: "/seattle",
    seoTitle: "Corporate Catering in Seattle & the Eastside",
    seoDescription:
      "iBirdChef provides corporate catering, office lunch catering, cultural menus and live stations across Seattle, Bellevue, Redmond and the Eastside.",
    localPoints: [
      {
        title: "Office meals for Seattle and the Eastside",
        description:
          "Boxed lunches, drop-off trays, and buffet service for Bellevue, Redmond, and Seattle workplaces—planned around timing and dietary needs.",
      },
      {
        title: "Cultural events and live stations",
        description:
          "South Asian menus, cultural employee events, and live dosa, chaat, and tandoor stations for offices and private gatherings.",
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
    headline: "Corporate catering for the San Francisco Bay Area.",
    summary:
      "Office meals, cultural menus, private events and live stations for San Francisco, Santa Clara, San Jose, Palo Alto, Fremont, Hayward, and surrounding communities.",
    cities: [
      "San Francisco",
      "Santa Clara",
      "Fremont",
      "Hayward",
      "San Jose",
      "Palo Alto",
    ],
    surroundingLabel: "and surrounding communities",
    accentHint: "california",
    path: "/bay-area",
    seoTitle: "Corporate Catering in the San Francisco Bay Area",
    seoDescription:
      "iBirdChef provides corporate catering, office meals, cultural menus and live stations across the San Francisco Bay Area, including Santa Clara, San Jose, Palo Alto, Fremont and San Francisco.",
    localPoints: [
      {
        title: "South Bay and Peninsula offices",
        description:
          "Menus for Santa Clara, San Jose, Palo Alto, and surrounding workplaces—planned for guest preferences and event flow.",
      },
      {
        title: "East Bay and San Francisco service",
        description:
          "Corporate lunches, receptions, cultural events, and private celebrations planned for Fremont, Hayward, San Francisco, and nearby communities.",
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
  "Corporate Catering for Seattle & the Eastside";

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
