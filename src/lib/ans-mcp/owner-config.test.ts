import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  ANS_APPROVED_BUSINESS_ADDRESS,
  ANS_APPROVED_BUSINESS_ADDRESS_LINES,
  businessAddressLinesFor,
  getBusinessAddressLines,
  resolveBusinessAddress,
} from "./owner-config";

afterEach(() => {
  delete process.env.ANS_BUSINESS_ADDRESS;
});

describe("business address configuration", () => {
  it("uses the approved default address and display lines", () => {
    delete process.env.ANS_BUSINESS_ADDRESS;
    assert.equal(resolveBusinessAddress(), ANS_APPROVED_BUSINESS_ADDRESS);
    assert.deepEqual(getBusinessAddressLines(), [...ANS_APPROVED_BUSINESS_ADDRESS_LINES]);
  });

  it("honors ANS_BUSINESS_ADDRESS overrides", () => {
    process.env.ANS_BUSINESS_ADDRESS =
      "100 Override Ave, Suite 5, Seattle, WA 98101, United States";
    assert.equal(
      resolveBusinessAddress(),
      "100 Override Ave, Suite 5, Seattle, WA 98101, United States",
    );
    const lines = getBusinessAddressLines();
    assert.ok(lines.includes("100 Override Ave"));
    assert.ok(lines.includes("Seattle"));
    assert.equal(lines.includes("3850 Klahanie Dr SE"), false);
  });

  it("splits multi-line overrides without keeping the default lines", () => {
    process.env.ANS_BUSINESS_ADDRESS = "1 Test Street\nUnit 2\nSeattle, WA 98101";
    assert.deepEqual(businessAddressLinesFor(resolveBusinessAddress()), [
      "1 Test Street",
      "Unit 2",
      "Seattle, WA 98101",
    ]);
  });
});
