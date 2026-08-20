import type { CuratedMenuItem, PricingKind, PublicMenuCategoryId } from "@/lib/curated-menu";
import { paths } from "@/lib/paths";

export const BUYING_CATEGORY_IDS = [
  "corporate-box-meals",
  "office-team-packages",
  "tray-drop-off",
  "buffet-catering",
  "vegetarian-dietary",
  "cultural-regional",
  "executive-premium",
  "live-stations",
  "private-events",
] as const;

export type BuyingCategoryId = (typeof BUYING_CATEGORY_IDS)[number];

export type BuyingCategory = {
  id: BuyingCategoryId;
  title: string;
  description: string;
  href: string;
  categoryIds?: readonly PublicMenuCategoryId[];
  serviceStyle?: CuratedMenuItem["serviceStyles"][number];
  pricing?: readonly PricingKind[];
};

export const BUYING_CATEGORIES: readonly BuyingCategory[] = [
  {
    id: "corporate-box-meals",
    title: "Corporate Box Meals",
    description:
      "Seasonal boxed lunches for office teams, with vegetarian and protein choices.",
    href: `${paths.menu}?buy=corporate-box-meals`,
    categoryIds: ["seasonal-boxed-lunches"],
  },
  {
    id: "office-team-packages",
    title: "Office / Team Meal Packages",
    description:
      "Individually packaged meals planned for workplace lunches and team gatherings.",
    href: `${paths.menu}?buy=office-team-packages`,
    serviceStyle: "Boxed meals",
  },
  {
    id: "tray-drop-off",
    title: "Tray & Drop-Off Catering",
    description:
      "Drop-off trays for offices that need dependable service without a full on-site setup.",
    href: `${paths.menu}?buy=tray-drop-off`,
    serviceStyle: "Drop-off catering",
  },
  {
    id: "buffet-catering",
    title: "Buffet Catering",
    description:
      "Shareable buffet menus for meetings, receptions, and larger workplace events.",
    href: `${paths.menu}?buy=buffet-catering`,
    serviceStyle: "Buffet",
  },
  {
    id: "vegetarian-dietary",
    title: "Vegetarian / Dietary-Friendly Options",
    description:
      "Vegetarian entrées, chaat, and sides that can be planned around guest dietary needs.",
    href: `${paths.menu}?buy=vegetarian-dietary`,
    categoryIds: [
      "vegetarian-appetizers-chaat",
      "indian-vegetarian-entrees",
      "breads-sides",
    ],
  },
  {
    id: "cultural-regional",
    title: "Cultural & Regional Menus",
    description:
      "South Asian and regional favorites for cultural employee events and mixed guest lists.",
    href: `${paths.menu}?buy=cultural-regional`,
    categoryIds: [
      "indian-vegetarian-entrees",
      "chicken-lamb-goat-entrees",
      "rice-biryani",
      "indo-chinese-asian",
    ],
  },
  {
    id: "executive-premium",
    title: "Executive / Premium Catering",
    description:
      "Market-priced seafood, lamb, goat, and grill selections for executive dining.",
    href: `${paths.menu}?buy=executive-premium`,
    pricing: ["market"],
  },
  {
    id: "live-stations",
    title: "Live Stations",
    description:
      "Chef-attended stations such as dosa, chaat, and tandoor/grill, quoted after review.",
    href: `${paths.menu}?buy=live-stations`,
    categoryIds: ["live-cooking-stations"],
  },
  {
    id: "private-events",
    title: "Private Events",
    description:
      "Birthdays, cultural celebrations, private dinners, and family gatherings.",
    href: paths.privateEvents,
  },
];

export function isBuyingCategoryId(value: unknown): value is BuyingCategoryId {
  return (
    typeof value === "string" &&
    (BUYING_CATEGORY_IDS as readonly string[]).includes(value)
  );
}

export function matchesBuyingCategory(
  item: CuratedMenuItem,
  buyingId: BuyingCategoryId | "all" | "",
): boolean {
  if (!buyingId || buyingId === "all") {
    return true;
  }

  const category = BUYING_CATEGORIES.find((entry) => entry.id === buyingId);
  if (!category || category.id === "private-events") {
    return true;
  }

  if (
    category.categoryIds?.length &&
    !category.categoryIds.includes(item.categoryId)
  ) {
    return false;
  }

  if (
    category.serviceStyle &&
    !item.serviceStyles.includes(category.serviceStyle)
  ) {
    return false;
  }

  if (category.pricing?.length && !category.pricing.includes(item.pricing)) {
    return false;
  }

  return true;
}
