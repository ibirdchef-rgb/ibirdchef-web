import {
  PUBLIC_MENU_CATEGORY_LABELS,
  curatedMenuItems,
  formatPricingLabel,
  type CuratedMenuItem,
  type PublicMenuCategoryId,
} from "@/lib/curated-menu";
import { formatBoxPrice } from "@/lib/menu";
import type { ConciergeMenuSuggestion, ConciergeSlots } from "@/lib/concierge/types";

function pricingLabel(item: CuratedMenuItem): string {
  return item.pricing === "seasonal_18"
    ? formatBoxPrice(18)
    : formatPricingLabel(item.pricing);
}

function toSuggestion(
  item: CuratedMenuItem,
  reason: string,
): ConciergeMenuSuggestion {
  return {
    id: item.id,
    name: item.name,
    categoryId: item.categoryId,
    categoryLabel: PUBLIC_MENU_CATEGORY_LABELS[item.categoryId],
    pricingLabel: pricingLabel(item),
    reason,
  };
}

function matchesCuisine(item: CuratedMenuItem, cuisine: string): boolean {
  const c = cuisine.toLowerCase();
  if (!c || c.includes("mixed") || c.includes("any")) return true;

  const indian =
    item.categoryId === "vegetarian-appetizers-chaat" ||
    item.categoryId === "tandoori-grill-kebabs" ||
    item.categoryId === "indian-vegetarian-entrees" ||
    item.categoryId === "chicken-lamb-goat-entrees" ||
    item.categoryId === "seafood-entrees" ||
    item.categoryId === "rice-biryani" ||
    item.categoryId === "breads-sides" ||
    item.categoryId === "desserts" ||
    item.categoryId === "live-cooking-stations" ||
    item.categoryId === "seasonal-boxed-lunches";

  if (/\bindian\b|\bsouth asian\b/.test(c)) {
    return indian && item.categoryId !== "indo-chinese-asian" && item.categoryId !== "salads-pasta-global";
  }
  if (/\bindo[- ]?chinese\b|\basian\b/.test(c)) {
    return (
      item.categoryId === "indo-chinese-asian" ||
      item.categoryId === "live-cooking-stations" ||
      /manchurian|hakka|kung pao|orange chicken|chili/i.test(item.name)
    );
  }
  if (/\bglobal\b|\bmexican\b|\bpasta\b|\bsalad\b|\blatin\b/.test(c)) {
    return item.categoryId === "salads-pasta-global";
  }
  return true;
}

function preferredCategories(slots: ConciergeSlots): PublicMenuCategoryId[] {
  if (slots.serviceStyle === "Boxed meals") {
    return ["seasonal-boxed-lunches", "breads-sides", "desserts"];
  }
  if (slots.serviceStyle === "Live cooking") {
    return [
      "live-cooking-stations",
      "vegetarian-appetizers-chaat",
      "tandoori-grill-kebabs",
      "rice-biryani",
      "desserts",
    ];
  }
  return [
    "indian-vegetarian-entrees",
    "chicken-lamb-goat-entrees",
    "rice-biryani",
    "breads-sides",
    "desserts",
    "vegetarian-appetizers-chaat",
  ];
}

/**
 * Recommend only from the approved public curated menu.
 * Never invent dishes, ingredients, dietary claims, or prices.
 */
export function recommendApprovedDishes(
  slots: ConciergeSlots,
  limit = 6,
): ConciergeMenuSuggestion[] {
  const selected = new Set(slots.selectedDishIds);
  const categories = preferredCategories(slots);
  const suggestions: ConciergeMenuSuggestion[] = [];

  for (const categoryId of categories) {
    const pool = curatedMenuItems.filter(
      (item) =>
        item.categoryId === categoryId &&
        !selected.has(item.id) &&
        matchesCuisine(item, slots.cuisinePreference),
    );
    for (const item of pool.slice(0, 2)) {
      suggestions.push(
        toSuggestion(
          item,
          `Approved ${PUBLIC_MENU_CATEGORY_LABELS[item.categoryId]} option for a balanced event menu.`,
        ),
      );
      if (suggestions.length >= limit) {
        return suggestions;
      }
    }
  }

  if (suggestions.length < limit) {
    for (const item of curatedMenuItems) {
      if (selected.has(item.id)) continue;
      if (!matchesCuisine(item, slots.cuisinePreference)) continue;
      if (suggestions.some((entry) => entry.id === item.id)) continue;
      suggestions.push(
        toSuggestion(
          item,
          `Approved menu selection that can complement your current plan.`,
        ),
      );
      if (suggestions.length >= limit) break;
    }
  }

  return suggestions;
}

export function findApprovedDishesByText(text: string): CuratedMenuItem[] {
  const normalized = text.toLowerCase();
  return curatedMenuItems.filter((item) =>
    normalized.includes(item.name.toLowerCase()),
  );
}

export function getApprovedDishById(id: string): CuratedMenuItem | undefined {
  return curatedMenuItems.find((item) => item.id === id);
}

export function listSelectedDishNames(ids: readonly string[]): string[] {
  return ids
    .map((id) => getApprovedDishById(id)?.name)
    .filter((name): name is string => Boolean(name));
}

export function buildBalancedMenuNote(slots: ConciergeSlots): string {
  const names = listSelectedDishNames(slots.selectedDishIds);
  if (!names.length) {
    return "No dishes selected yet. I can recommend entrées, sides, rice, breads, and dessert when you are ready.";
  }
  return `Current selections: ${names.join("; ")}. I can suggest complementary items without replacing your choices unless you ask.`;
}
