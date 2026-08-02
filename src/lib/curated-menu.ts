/**
 * Curated public menu V1 — approved 78-item inclusion list only.
 * Internal source fields are for engineering traceability and must never
 * be rendered in the public UI.
 */

import { seasonalBoxes, type SeasonalBox } from "@/lib/menu";
import {
  EVENT_CATEGORY_LABELS,
  SERVICE_STYLES,
  type EventCategory,
} from "@/lib/event-inquiry";
import type { ServiceRegion } from "@/lib/regions";

export const PUBLIC_MENU_CATEGORIES = [
  "seasonal-boxed-lunches",
  "vegetarian-appetizers-chaat",
  "tandoori-grill-kebabs",
  "indian-vegetarian-entrees",
  "chicken-lamb-goat-entrees",
  "seafood-entrees",
  "rice-biryani",
  "indo-chinese-asian",
  "salads-pasta-global",
  "breads-sides",
  "desserts",
  "live-cooking-stations",
] as const;

export type PublicMenuCategoryId = (typeof PUBLIC_MENU_CATEGORIES)[number];

export const PUBLIC_MENU_CATEGORY_LABELS: Record<PublicMenuCategoryId, string> =
  {
    "seasonal-boxed-lunches": "Seasonal Boxed Lunches",
    "vegetarian-appetizers-chaat": "Vegetarian Appetizers & Chaat",
    "tandoori-grill-kebabs": "Tandoori, Grill & Kebabs",
    "indian-vegetarian-entrees": "Indian Vegetarian Entrées",
    "chicken-lamb-goat-entrees": "Chicken, Lamb & Goat Entrées",
    "seafood-entrees": "Seafood Entrées",
    "rice-biryani": "Rice & Biryani",
    "indo-chinese-asian": "Indo-Chinese & Asian Favorites",
    "salads-pasta-global": "Salads, Pasta & Global Favorites",
    "breads-sides": "Breads & Sides",
    desserts: "Desserts",
    "live-cooking-stations": "Live Cooking Stations",
  };

/** Opaque internal corpus tags — never show in UI. */
export type InternalCorpus =
  | "seasonal_program"
  | "ibirdchef_workbook"
  | "ibirdchef_catering_pdf";

export type PricingKind =
  | "seasonal_18"
  | "custom_quote"
  | "market"
  | "live_station_proposal";

export type CuratedMenuItem = {
  id: string;
  name: string;
  categoryId: PublicMenuCategoryId;
  pricing: PricingKind;
  /** Navigation aids only — not availability promises. */
  serviceStyles: readonly (typeof SERVICE_STYLES)[number][];
  /** Navigation aids only — not availability promises. */
  eventCategories: readonly EventCategory[];
  /** Both dual-market regions; confirmation happens after review. */
  regions: readonly ServiceRegion[];
  /** Private engineering traceability — do not render. */
  internal: {
    corpus: InternalCorpus;
    sourceCategory: string;
    seasonalBoxId?: SeasonalBox["id"];
  };
  /** Optional extra public note (live stations / fall lamb). */
  publicNote?: string;
};

const BOTH_REGIONS = ["seattle", "bay_area"] as const satisfies ServiceRegion[];

const GENERAL_STYLES = [
  "Buffet",
  "Plated",
  "Family style",
  "Drop-off catering",
  "Not sure yet",
] as const satisfies readonly (typeof SERVICE_STYLES)[number][];

const GENERAL_EVENTS = [
  "corporate",
  "personal_family",
  "private_chef",
  "other",
] as const satisfies readonly EventCategory[];

function item(
  partial: Omit<CuratedMenuItem, "regions" | "serviceStyles" | "eventCategories"> &
    Partial<
      Pick<CuratedMenuItem, "regions" | "serviceStyles" | "eventCategories">
    >,
): CuratedMenuItem {
  return {
    ...partial,
    regions: partial.regions ?? BOTH_REGIONS,
    serviceStyles: partial.serviceStyles ?? GENERAL_STYLES,
    eventCategories: partial.eventCategories ?? GENERAL_EVENTS,
  };
}

const seasonalItems: CuratedMenuItem[] = seasonalBoxes.map((box) =>
  item({
    id: `seasonal-${box.season.toLowerCase()}`,
    name: `${box.season} Boxed Lunch`,
    categoryId: "seasonal-boxed-lunches",
    pricing: "seasonal_18",
    serviceStyles: ["Boxed meals", "Drop-off catering", "Not sure yet"],
    eventCategories: ["corporate", "personal_family", "other"],
    internal: {
      corpus: "seasonal_program",
      sourceCategory: "Approved seasonal boxed-lunch program",
      seasonalBoxId: box.id,
    },
    publicNote:
      box.season === "Fall"
        ? "Kashmiri Lamb Rogan Josh is priced separately when selected as the protein entrée."
        : undefined,
  }),
);

const dishItems: CuratedMenuItem[] = [
  // Vegetarian Appetizers & Chaat (7)
  item({
    id: "hara-bhara-tikki",
    name: "Hara Bhara Tikki",
    categoryId: "vegetarian-appetizers-chaat",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian appetizers / chaat / tikki",
    },
  }),
  item({
    id: "punjabi-potato-samosa",
    name: "Punjabi Potato Samosa",
    categoryId: "vegetarian-appetizers-chaat",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian appetizers / chaat / tikki",
    },
  }),
  item({
    id: "button-mushroom-cheese-tikki",
    name: "Button Mushroom Cheese Tikki",
    categoryId: "vegetarian-appetizers-chaat",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian appetizers / chaat / tikki",
    },
  }),
  item({
    id: "sabudana-vada",
    name: "Sabudana Vada",
    categoryId: "vegetarian-appetizers-chaat",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian appetizers / chaat / tikki",
    },
  }),
  item({
    id: "dahi-ke-kebab",
    name: "Dahi Ke Kebab",
    categoryId: "vegetarian-appetizers-chaat",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian appetizers / chaat / tikki",
    },
  }),
  item({
    id: "chefs-special-palak-chaat",
    name: "Chef’s Special Palak Chaat",
    categoryId: "vegetarian-appetizers-chaat",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian appetizers / chaat / tikki",
    },
  }),
  item({
    id: "kurkure-bhindi",
    name: "Kurkure Bhindi",
    categoryId: "vegetarian-appetizers-chaat",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian appetizers / chaat / tikki",
    },
  }),

  // Tandoori, Grill & Kebabs (8)
  item({
    id: "tandoori-paneer-tikka",
    name: "Tandoori Paneer Tikka",
    categoryId: "tandoori-grill-kebabs",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),
  item({
    id: "malai-paneer-tikka",
    name: "Malai Paneer Tikka",
    categoryId: "tandoori-grill-kebabs",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),
  item({
    id: "green-mango-paneer-tikka-achari",
    name: "Green Mango Paneer Tikka Achari",
    categoryId: "tandoori-grill-kebabs",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),
  item({
    id: "tandoori-chicken",
    name: "Tandoori Chicken",
    categoryId: "tandoori-grill-kebabs",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),
  item({
    id: "malai-chicken-kebab",
    name: "Malai Chicken Kebab",
    categoryId: "tandoori-grill-kebabs",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),
  item({
    id: "achari-chicken-wings",
    name: "Achari Chicken Wings",
    categoryId: "tandoori-grill-kebabs",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),
  item({
    id: "chipotle-chicken-kebab",
    name: "Chipotle Chicken Kebab",
    categoryId: "tandoori-grill-kebabs",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),
  item({
    id: "lamb-shami-kebab",
    name: "Lamb Shami Kebab",
    categoryId: "tandoori-grill-kebabs",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / kebab",
    },
  }),

  // Indian Vegetarian Entrées (8)
  item({
    id: "paneer-edamame-saag",
    name: "Paneer & Edamame Saag",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian entrées / dal",
    },
  }),
  item({
    id: "kadhai-paneer-sunchoke",
    name: "Kadhai Paneer Sunchoke",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian entrées / dal",
    },
  }),
  item({
    id: "kashmiri-dum-aloo",
    name: "Kashmiri Dum Aloo",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian entrées / dal",
    },
  }),
  item({
    id: "paneer-butter-masala-cashew-almond",
    name: "Paneer Butter Masala with Cashew & Almond",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "VEG MENU — Entrées",
    },
  }),
  item({
    id: "yellow-dal",
    name: "Yellow Dal",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian entrées / dal",
    },
  }),
  item({
    id: "pindi-chana",
    name: "Pindi Chana",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "VEG MENU — Entrées",
    },
  }),
  item({
    id: "gujarati-undhiyu",
    name: "Gujarati Undhiyu",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian entrées / dal",
    },
  }),
  item({
    id: "chettinad-vada-curry",
    name: "Chettinad Vada Curry",
    categoryId: "indian-vegetarian-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Vegetarian entrées / dal",
    },
  }),

  // Chicken, Lamb & Goat Entrées (8)
  item({
    id: "butter-chicken",
    name: "Butter Chicken",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Protein entrées",
    },
  }),
  item({
    id: "chicken-tikka-masala",
    name: "Chicken Tikka Masala",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "PROTEIN MENU — Entrées",
    },
  }),
  item({
    id: "chicken-tikka-masala-shiitake",
    name: "Chicken Tikka Masala with Shiitake Mushroom",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Protein entrées",
    },
  }),
  item({
    id: "kolhapuri-chicken",
    name: "Kolhapuri Chicken",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Protein entrées",
    },
  }),
  item({
    id: "andhra-chicken-curry",
    name: "Andhra Chicken Curry",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Protein entrées",
    },
  }),
  item({
    id: "kashmiri-lamb-rogan-josh",
    name: "Kashmiri Lamb Rogan Josh",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Protein entrées",
    },
    publicNote:
      "Premium lamb — market pricing. When selected in the Fall boxed lunch, priced separately from the $18 box.",
  }),
  item({
    id: "lamb-vindaloo",
    name: "Lamb Vindaloo",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "PROTEIN MENU — Entrées",
    },
  }),
  item({
    id: "punjabi-goat-curry",
    name: "Punjabi Goat Curry",
    categoryId: "chicken-lamb-goat-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Protein entrées",
    },
  }),

  // Seafood Entrées (5)
  item({
    id: "tandoori-shrimp",
    name: "Tandoori Shrimp",
    categoryId: "seafood-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / seafood",
    },
  }),
  item({
    id: "tawa-crab-masala",
    name: "Tawa Crab Masala",
    categoryId: "seafood-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Tandoori / grill / seafood",
    },
  }),
  item({
    id: "shrimp-moilee",
    name: "Shrimp Moilee",
    categoryId: "seafood-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Seafood entrées",
    },
  }),
  item({
    id: "karavalli-fish-curry",
    name: "Karavalli Fish Curry",
    categoryId: "seafood-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Seafood entrées",
    },
  }),
  item({
    id: "andhra-pomfret-fish-curry",
    name: "Andhra Pomfret Fish Curry",
    categoryId: "seafood-entrees",
    pricing: "market",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "SEA FOOD MENU — Entrées",
    },
  }),

  // Rice & Biryani (8)
  item({
    id: "steamed-basmati-rice",
    name: "Steamed Basmati Rice",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Rice / biryani",
    },
  }),
  item({
    id: "tomato-rice",
    name: "Tomato Rice",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Rice / biryani",
    },
  }),
  item({
    id: "coconut-rice",
    name: "Coconut Rice",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Rice / biryani",
    },
  }),
  item({
    id: "tamil-nadu-tamarind-rice",
    name: "Tamil Nadu Tamarind Rice & Mango Pickle",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "VEG MENU — Rice & noodles",
    },
  }),
  item({
    id: "vegetable-biryani",
    name: "Vegetable Biryani",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Rice / biryani",
    },
  }),
  item({
    id: "paneer-biryani",
    name: "Paneer Biryani",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Rice / biryani",
    },
  }),
  item({
    id: "chicken-65-biryani",
    name: "Chicken 65 Biryani",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Rice / biryani",
    },
  }),
  item({
    id: "ambur-biryani",
    name: "Ambur Biryani",
    categoryId: "rice-biryani",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Rice / biryani",
    },
  }),

  // Indo-Chinese & Asian Favorites (8)
  item({
    id: "gobi-manchurian-bell-peppers",
    name: "Gobi Manchurian with Bell Peppers",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "VEG MENU — Appetizers",
    },
  }),
  item({
    id: "chili-paneer-fresno-bell-peppers",
    name: "Chili Paneer with Fresno Chili & Bell Peppers",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "VEG MENU — Appetizers",
    },
  }),
  item({
    id: "gobi-65-lemon-onion",
    name: "Gobi 65 with Lemon & Onion",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "VEG MENU — Appetizers",
    },
  }),
  item({
    id: "chicken-manchurian-broccoli",
    name: "Chicken Manchurian with Broccoli",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "PROTEIN MENU — Appetizers",
    },
  }),
  item({
    id: "chili-chicken-bell-peppers-long-beans",
    name: "Chili Chicken with Bell Peppers & Long Beans",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "PROTEIN MENU — Appetizers",
    },
  }),
  item({
    id: "kung-pao-chicken",
    name: "Kung Pao Chicken",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "PROTEIN MENU — Stir-fry",
    },
  }),
  item({
    id: "orange-chicken",
    name: "Orange Chicken",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "PROTEIN MENU — Asian protein",
    },
  }),
  item({
    id: "hakka-noodles",
    name: "Hakka Noodles",
    categoryId: "indo-chinese-asian",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "VEG MENU — Rice & noodles",
    },
  }),

  // Salads, Pasta & Global Favorites (6)
  item({
    id: "caesar-salad",
    name: "Caesar Salad",
    categoryId: "salads-pasta-global",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "Salad",
    },
  }),
  item({
    id: "caprese-salad",
    name: "Caprese Salad",
    categoryId: "salads-pasta-global",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "Salad",
    },
  }),
  item({
    id: "asian-salad",
    name: "Asian Salad",
    categoryId: "salads-pasta-global",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "Salad",
    },
  }),
  item({
    id: "chipotle-pasta",
    name: "Chipotle Pasta",
    categoryId: "salads-pasta-global",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "Pasta",
    },
  }),
  item({
    id: "lemon-butter-pasta",
    name: "Lemon Butter Pasta",
    categoryId: "salads-pasta-global",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "Pasta",
    },
  }),
  item({
    id: "chicken-in-poblano-cream",
    name: "Chicken in Poblano Cream",
    categoryId: "salads-pasta-global",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "Mexican traditional",
    },
  }),

  // Breads & Sides (5)
  item({
    id: "garlic-naan",
    name: "Garlic Naan",
    categoryId: "breads-sides",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Breads / salads",
    },
  }),
  item({
    id: "butter-naan",
    name: "Butter Naan",
    categoryId: "breads-sides",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Breads / salads",
    },
  }),
  item({
    id: "tandoori-roti",
    name: "Tandoori Roti",
    categoryId: "breads-sides",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Breads / salads",
    },
  }),
  item({
    id: "indian-cucumber-salad",
    name: "Indian Cucumber Salad",
    categoryId: "breads-sides",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Breads / salads",
    },
  }),
  item({
    id: "mango-olive-salad",
    name: "Mango Olive Salad",
    categoryId: "breads-sides",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Breads / salads",
    },
  }),

  // Desserts (5)
  item({
    id: "saffron-rice-kheer",
    name: "Saffron Rice Kheer",
    categoryId: "desserts",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Desserts",
    },
  }),
  item({
    id: "malai-kulfi",
    name: "Malai Kulfi",
    categoryId: "desserts",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Desserts",
    },
  }),
  item({
    id: "coconut-pistachio-snowball",
    name: "Coconut Pistachio Snowball",
    categoryId: "desserts",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Desserts",
    },
  }),
  item({
    id: "cardamom-panna-cotta",
    name: "Cardamom Panna Cotta",
    categoryId: "desserts",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_catering_pdf",
      sourceCategory: "Desserts",
    },
  }),
  item({
    id: "saffron-rabri-rasmalai",
    name: "Saffron Rabri Rasmalai",
    categoryId: "desserts",
    pricing: "custom_quote",
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "DESSERT MENU",
    },
  }),

  // Live Cooking Stations (6)
  item({
    id: "live-dosa-corner",
    name: "Live Dosa Corner",
    categoryId: "live-cooking-stations",
    pricing: "live_station_proposal",
    serviceStyles: ["Live cooking", "Not sure yet"],
    eventCategories: ["corporate", "personal_family", "private_chef", "other"],
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "CONCEPT — Live stations",
    },
  }),
  item({
    id: "live-bbq-corner",
    name: "Live BBQ Corner",
    categoryId: "live-cooking-stations",
    pricing: "live_station_proposal",
    serviceStyles: ["Live cooking", "Not sure yet"],
    eventCategories: ["corporate", "personal_family", "private_chef", "other"],
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "CONCEPT — Live stations",
    },
  }),
  item({
    id: "live-indo-chinese-corner",
    name: "Live Indo-Chinese Corner",
    categoryId: "live-cooking-stations",
    pricing: "live_station_proposal",
    serviceStyles: ["Live cooking", "Not sure yet"],
    eventCategories: ["corporate", "personal_family", "private_chef", "other"],
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "CONCEPT — Live stations",
    },
  }),
  item({
    id: "live-grill-corner",
    name: "Live Grill Corner",
    categoryId: "live-cooking-stations",
    pricing: "live_station_proposal",
    serviceStyles: ["Live cooking", "Not sure yet"],
    eventCategories: ["corporate", "personal_family", "private_chef", "other"],
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "CONCEPT — Live stations",
    },
  }),
  item({
    id: "live-biryani-corner",
    name: "Live Biryani Corner",
    categoryId: "live-cooking-stations",
    pricing: "live_station_proposal",
    serviceStyles: ["Live cooking", "Not sure yet"],
    eventCategories: ["corporate", "personal_family", "private_chef", "other"],
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "CONCEPT — Live stations",
    },
  }),
  item({
    id: "live-chaat-bites-corner",
    name: "Live Chaat & Bites Corner",
    categoryId: "live-cooking-stations",
    pricing: "live_station_proposal",
    serviceStyles: ["Live cooking", "Not sure yet"],
    eventCategories: ["corporate", "personal_family", "private_chef", "other"],
    internal: {
      corpus: "ibirdchef_workbook",
      sourceCategory: "CONCEPT — Live stations",
    },
  }),
];

/** Approved public V1 menu — exactly 78 items. */
export const curatedMenuItems: CuratedMenuItem[] = [
  ...seasonalItems,
  ...dishItems,
];

export const PUBLIC_MENU_ITEM_COUNT = 78;
export const AVAILABILITY_NOTICE =
  "Availability confirmed after event review.";
export const DIETARY_ALLERGEN_NOTICE =
  "Dietary and allergen information is provided as a planning guide. Please disclose all allergies and dietary requirements with your inquiry so our culinary team can confirm ingredients and preparation requirements.";
export const LIVE_STATION_NOTICE =
  "Menu selections and availability are confirmed after event review.";

export function formatPricingLabel(pricing: PricingKind): string {
  switch (pricing) {
    case "seasonal_18":
      return "$18 per person";
    case "custom_quote":
      return "Request a Custom Quote";
    case "market":
      return "Market pricing";
    case "live_station_proposal":
      return "Chef-approved custom proposal";
    default: {
      const _exhaustive: never = pricing;
      return _exhaustive;
    }
  }
}

export function getSeasonalBoxForItem(
  item: CuratedMenuItem,
): SeasonalBox | undefined {
  if (!item.internal.seasonalBoxId) {
    return undefined;
  }
  return seasonalBoxes.find((box) => box.id === item.internal.seasonalBoxId);
}

export function buildAskAboutDishHref(item: CuratedMenuItem): string {
  return buildInquiryHrefForItemIds([item.id]);
}

export function buildInquiryHrefForItemIds(itemIds: readonly string[]): string {
  const params = new URLSearchParams();
  const uniqueIds = [...new Set(itemIds.filter(Boolean))];
  if (uniqueIds.length === 1) {
    const item = curatedMenuItems.find((entry) => entry.id === uniqueIds[0]);
    if (item) {
      params.set("askDish", item.name);
      params.set("askCategory", PUBLIC_MENU_CATEGORY_LABELS[item.categoryId]);
    }
  } else if (uniqueIds.length > 1) {
    params.set("askDishes", uniqueIds.join(","));
  }
  const query = params.toString();
  return query ? `/?${query}#contact` : "/#contact";
}

export function resolveMenuItemsFromInquiryParams(input: {
  askDish?: string | null;
  askCategory?: string | null;
  askDishes?: string | null;
}): CuratedMenuItem[] {
  const ids = (input.askDishes ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (ids.length) {
    const byId = new Map(curatedMenuItems.map((item) => [item.id, item]));
    return ids
      .map((id) => byId.get(id))
      .filter((item): item is CuratedMenuItem => Boolean(item));
  }

  const dishName = input.askDish?.trim();
  if (!dishName) {
    return [];
  }
  const match = curatedMenuItems.find(
    (item) => item.name.toLowerCase() === dishName.toLowerCase(),
  );
  return match ? [match] : [];
}

export function buildDishInquiryMessage(
  dishName: string,
  categoryLabel: string,
): string {
  return buildMultiDishInquiryMessage([
    { name: dishName, categoryLabel },
  ]);
}

export function buildMultiDishInquiryMessage(
  dishes: readonly { name: string; categoryLabel: string }[],
): string {
  if (!dishes.length) {
    return "";
  }

  if (dishes.length === 1) {
    const only = dishes[0]!;
    return [
      `I would like to ask about this dish: ${only.name}.`,
      `Menu category: ${only.categoryLabel}.`,
      "",
      "Please follow up with a custom, chef-approved proposal after reviewing our event details.",
      "This inquiry is not a booking or price confirmation.",
    ].join("\n");
  }

  return [
    `I would like to ask about these ${dishes.length} menu selections:`,
    ...dishes.map(
      (dish, index) =>
        `${index + 1}. ${dish.name} (${dish.categoryLabel})`,
    ),
    "",
    "Please follow up with a custom, chef-approved proposal after reviewing our event details.",
    "This inquiry is not a booking or price confirmation.",
  ].join("\n");
}

export const MENU_INQUIRY_NOTICE =
  "Menu selections, pricing and availability are confirmed after event review. Adding a dish to your inquiry does not create a booking.";

export type MenuFilterState = {
  query: string;
  region: ServiceRegion | "all";
  categoryId: PublicMenuCategoryId | "all";
  serviceStyle: (typeof SERVICE_STYLES)[number] | "all";
  eventCategory: EventCategory | "all";
};

export function filterCuratedMenu(
  items: readonly CuratedMenuItem[],
  filters: MenuFilterState,
): CuratedMenuItem[] {
  const q = filters.query.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.categoryId !== "all" && item.categoryId !== filters.categoryId) {
      return false;
    }
    if (
      filters.region !== "all" &&
      !item.regions.includes(filters.region)
    ) {
      return false;
    }
    if (
      filters.serviceStyle !== "all" &&
      !item.serviceStyles.includes(filters.serviceStyle)
    ) {
      return false;
    }
    if (
      filters.eventCategory !== "all" &&
      !item.eventCategories.includes(filters.eventCategory)
    ) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack = [
      item.name,
      PUBLIC_MENU_CATEGORY_LABELS[item.categoryId],
      formatPricingLabel(item.pricing),
      item.publicNote ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function countByCategory(
  items: readonly CuratedMenuItem[],
): Record<PublicMenuCategoryId, number> {
  const counts = Object.fromEntries(
    PUBLIC_MENU_CATEGORIES.map((id) => [id, 0]),
  ) as Record<PublicMenuCategoryId, number>;
  for (const item of items) {
    counts[item.categoryId] += 1;
  }
  return counts;
}

export function eventCategoryFilterLabel(category: EventCategory): string {
  return EVENT_CATEGORY_LABELS[category];
}
