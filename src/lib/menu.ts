export type MenuItem = {
  id: string;
  name: string;
};

export type MenuCategory = {
  id: string;
  title: string;
  description: string;
  items: MenuItem[];
};

export type EntréeOption = {
  name: string;
  /** When false, this option is excluded from the $18 box price. */
  includedInBoxPrice: boolean;
};

export type SeasonalBox = {
  id: string;
  season: "Spring" | "Summer" | "Fall" | "Winter";
  pricePerPerson: number;
  rice: string;
  lentil: string;
  side: string;
  /** Required public choice: vegetarian or protein. */
  entrée: {
    vegetarian: EntréeOption;
    protein: EntréeOption;
  };
  notes?: string[];
};

/**
 * Seasonal lunch boxes at the established $18/person program price.
 * Each box is one menu item with a required vegetarian vs protein choice.
 *
 * Kashmiri Lamb Rogan Josh is listed for Fall but priced separately —
 * premium lamb is excluded from the fixed $18 margin until confirmed.
 *
 * À la carte categories below only include dishes named in this seasonal
 * program. Expand when a fuller approved iBirdChef menu source is provided.
 */
export const seasonalBoxes: SeasonalBox[] = [
  {
    id: "box-spring",
    season: "Spring",
    pricePerPerson: 18,
    rice: "Steamed Basmati Rice",
    lentil: "Yellow Dal",
    side: "Indian Cucumber Salad",
    entrée: {
      vegetarian: {
        name: "Paneer & Edamame Saag",
        includedInBoxPrice: true,
      },
      protein: {
        name: "Chicken Tikka Masala with Shiitake Mushroom",
        includedInBoxPrice: true,
      },
    },
  },
  {
    id: "box-summer",
    season: "Summer",
    pricePerPerson: 18,
    rice: "Coconut Rice",
    lentil: "Yellow Dal",
    side: "Mango Olive Salad",
    entrée: {
      vegetarian: {
        name: "Tandoori Paneer Tikka",
        includedInBoxPrice: true,
      },
      protein: {
        name: "Tandoori Shrimp",
        includedInBoxPrice: true,
      },
    },
  },
  {
    id: "box-fall",
    season: "Fall",
    pricePerPerson: 18,
    rice: "Tomato Rice",
    lentil: "Yellow Dal",
    side: "Chettinad Vada Curry",
    entrée: {
      vegetarian: {
        name: "Kadhai Paneer Sunchoke",
        includedInBoxPrice: true,
      },
      protein: {
        name: "Kashmiri Lamb Rogan Josh",
        includedInBoxPrice: false,
      },
    },
    notes: [
      "Vegetarian entrée is included in the $18 per-person box price.",
      "Kashmiri Lamb Rogan Josh is a premium protein and is priced separately.",
    ],
  },
  {
    id: "box-winter",
    season: "Winter",
    pricePerPerson: 18,
    rice: "Steamed Basmati Rice",
    lentil: "Yellow Dal",
    side: "Punjabi Goat Curry (or vegetarian substitute)",
    entrée: {
      vegetarian: {
        name: "Kashmiri Dum Aloo",
        includedInBoxPrice: true,
      },
      protein: {
        name: "Butter Chicken",
        includedInBoxPrice: true,
      },
    },
    notes: [
      "Ask for a vegetarian substitute if you prefer not to include Punjabi Goat Curry as the side.",
    ],
  },
];

function uniqueItems(names: string[]): MenuItem[] {
  const seen = new Set<string>();
  const items: MenuItem[] = [];

  for (const name of names) {
    const key = name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    items.push({
      id: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      name,
    });
  }

  return items;
}

/** Price-free à la carte foundation built only from seasonal-box dishes. */
export const menuCategories: MenuCategory[] = [
  {
    id: "rice",
    title: "Rice",
    description: "Rice selections featured in our seasonal boxed lunches.",
    items: uniqueItems(seasonalBoxes.map((box) => box.rice)),
  },
  {
    id: "lentils",
    title: "Lentils",
    description: "Dal accompaniments from the seasonal box program.",
    items: uniqueItems(seasonalBoxes.map((box) => box.lentil)),
  },
  {
    id: "vegetarian-entrees",
    title: "Vegetarian Entrées",
    description: "Vegetarian hot entrées available as a seasonal box choice.",
    items: uniqueItems(
      seasonalBoxes.map((box) => box.entrée.vegetarian.name),
    ),
  },
  {
    id: "protein-entrees",
    title: "Protein Entrées",
    description:
      "Protein hot entrées from the seasonal program. Premium proteins may be priced separately.",
    items: uniqueItems(seasonalBoxes.map((box) => box.entrée.protein.name)),
  },
  {
    id: "sides",
    title: "Sides",
    description: "Sides paired with seasonal boxed lunches.",
    items: uniqueItems(seasonalBoxes.map((box) => box.side)),
  },
];

export function formatBoxPrice(pricePerPerson: number): string {
  return `$${pricePerPerson} per person`;
}
