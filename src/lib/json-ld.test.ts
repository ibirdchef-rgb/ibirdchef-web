import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BUYING_CATEGORIES } from "@/lib/buying-categories";
import { buildCatererJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { siteConfig } from "@/lib/site";

describe("public JSON-LD", () => {
  it("serializes valid Caterer markup with verified contact fields", () => {
    const jsonLd = buildCatererJsonLd();
    const serialized = serializeJsonLd(jsonLd);
    const parsed = JSON.parse(serialized) as Record<string, unknown>;

    assert.equal(parsed["@type"], "Caterer");
    assert.equal(parsed.name, "iBirdChef");
    assert.equal(parsed.email, siteConfig.emailDisplay);
    assert.equal(parsed.telephone, "+14256006692");
    assert.ok(Array.isArray(parsed.address));
    assert.equal((parsed.address as unknown[]).length, 2);
    assert.doesNotMatch(serialized, /aggregateRating|reviewRating|openingHours/);
    assert.match(serialized, /14510 NE 20th St/);
    assert.match(serialized, /2181 Laurelwood Rd/);
    assert.match(serialized, /order@ibirdchef.com/);
  });
});

describe("buying categories", () => {
  it("keeps nine customer-facing categories without inventing dishes", () => {
    assert.equal(BUYING_CATEGORIES.length, 9);
    assert.equal(
      BUYING_CATEGORIES.some((category) => category.id === "live-stations"),
      true,
    );
  });
});
