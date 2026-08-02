import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PUBLIC_MENU_CATEGORIES,
  PUBLIC_MENU_ITEM_COUNT,
  buildInquiryHrefForItemIds,
  buildMultiDishInquiryMessage,
  curatedMenuItems,
  countByCategory,
  filterCuratedMenu,
  formatPricingLabel,
  resolveMenuItemsFromInquiryParams,
} from "@/lib/curated-menu";

describe("curated menu V1", () => {
  it("publishes exactly 78 unique items", () => {
    assert.equal(curatedMenuItems.length, PUBLIC_MENU_ITEM_COUNT);
    assert.equal(curatedMenuItems.length, 78);

    const ids = curatedMenuItems.map((item) => item.id);
    assert.equal(new Set(ids).size, 78);

    const names = curatedMenuItems.map((item) => item.name);
    assert.equal(new Set(names).size, 78);
  });

  it("keeps approved category counts", () => {
    const counts = countByCategory(curatedMenuItems);
    assert.equal(counts["seasonal-boxed-lunches"], 4);
    assert.equal(counts["vegetarian-appetizers-chaat"], 7);
    assert.equal(counts["tandoori-grill-kebabs"], 8);
    assert.equal(counts["indian-vegetarian-entrees"], 8);
    assert.equal(counts["chicken-lamb-goat-entrees"], 8);
    assert.equal(counts["seafood-entrees"], 5);
    assert.equal(counts["rice-biryani"], 8);
    assert.equal(counts["indo-chinese-asian"], 8);
    assert.equal(counts["salads-pasta-global"], 6);
    assert.equal(counts["breads-sides"], 5);
    assert.equal(counts.desserts, 5);
    assert.equal(counts["live-cooking-stations"], 6);

    const total = PUBLIC_MENU_CATEGORIES.reduce(
      (sum, id) => sum + counts[id],
      0,
    );
    assert.equal(total, 78);
  });

  it("uses final approved public names", () => {
    const names = new Set(curatedMenuItems.map((item) => item.name));
    assert.ok(names.has("Gujarati Undhiyu"));
    assert.ok(names.has("Vegetable Biryani"));
    assert.ok(names.has("Ambur Biryani"));
    assert.ok(names.has("Hakka Noodles"));
    assert.ok(names.has("Sabudana Vada"));
    assert.ok(names.has("Kolhapuri Chicken"));
    assert.ok(names.has("Lamb Shami Kebab"));
    assert.ok(names.has("Saffron Rabri Rasmalai"));
    assert.ok(names.has("Gobi Manchurian with Bell Peppers"));
    assert.ok(names.has("Chili Chicken with Bell Peppers & Long Beans"));
    assert.ok(names.has("Chili Paneer with Fresno Chili & Bell Peppers"));
    assert.ok(names.has("Chicken Tikka Masala"));
    assert.ok(names.has("Chicken Tikka Masala with Shiitake Mushroom"));
    assert.ok(names.has("Live Indo-Chinese Corner"));
    assert.ok(names.has("Live Chaat & Bites Corner"));

    assert.equal(names.has("Vegetable Pulao"), false);
    assert.equal(names.has("Veg Egg"), false);
    assert.equal(names.has("Hakka Noodle Yakisoba Noodle"), false);
  });

  it("never exposes historical package prices in public labels", () => {
    for (const item of curatedMenuItems) {
      const label = formatPricingLabel(item.pricing);
      assert.equal(/\$40|\$50|\$100/.test(label), false);
      if (item.pricing === "seasonal_18") {
        assert.equal(label, "$18 per person");
      }
      if (item.pricing === "live_station_proposal") {
        assert.equal(label, "Chef-approved custom proposal");
      }
    }
  });

  it("filters by category and search without inventing items", () => {
    const seafood = filterCuratedMenu(curatedMenuItems, {
      query: "",
      region: "all",
      categoryId: "seafood-entrees",
      serviceStyle: "all",
      eventCategory: "all",
    });
    assert.equal(seafood.length, 5);

    const butter = filterCuratedMenu(curatedMenuItems, {
      query: "butter chicken",
      region: "seattle",
      categoryId: "all",
      serviceStyle: "all",
      eventCategory: "all",
    });
    assert.equal(butter.length, 1);
    assert.equal(butter[0]?.name, "Butter Chicken");
  });

  it("supports multi-dish inquiry prefills without inventing items", () => {
    const butter = curatedMenuItems.find((item) => item.id === "butter-chicken");
    const shrimp = curatedMenuItems.find((item) => item.id === "tandoori-shrimp");
    assert.ok(butter);
    assert.ok(shrimp);

    const href = buildInquiryHrefForItemIds([butter.id, shrimp.id]);
    assert.match(href, /askDishes=/);
    assert.match(href, /#contact$/);

    const resolved = resolveMenuItemsFromInquiryParams({
      askDishes: `${butter.id},${shrimp.id}`,
    });
    assert.equal(resolved.length, 2);
    assert.equal(resolved[0]?.name, "Butter Chicken");
    assert.equal(resolved[1]?.name, "Tandoori Shrimp");

    const message = buildMultiDishInquiryMessage(
      resolved.map((item) => ({
        name: item.name,
        categoryLabel: item.categoryId,
      })),
    );
    assert.match(message, /these 2 menu selections/);
    assert.match(message, /Butter Chicken/);
    assert.match(message, /Tandoori Shrimp/);
    assert.match(message, /not a booking or price confirmation/);
  });
});
