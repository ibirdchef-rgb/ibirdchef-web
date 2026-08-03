import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONTACT_PRIVACY_NOTICE,
  contactFieldError,
  formatMaskedContactLine,
  inputConfigForContactField,
  isValidEmail,
  isValidPhone,
  maskContactText,
  maskEmail,
  maskPhone,
  wantsToSkipPhone,
} from "@/lib/concierge/contact";

describe("concierge contact helpers", () => {
  it("validates email and phone formats", () => {
    assert.equal(isValidEmail("alex@example.com"), true);
    assert.equal(isValidEmail("not-an-email"), false);
    assert.equal(isValidPhone("425-555-0100"), true);
    assert.equal(isValidPhone("(425) 555-0100"), true);
    assert.equal(isValidPhone("555-0100"), false);
  });

  it("returns friendly inline errors", () => {
    assert.match(
      contactFieldError("email", "bad") ?? "",
      /doesn’t look quite right/i,
    );
    assert.match(
      contactFieldError("phone", "123") ?? "",
      /10-digit|skip/i,
    );
    assert.equal(contactFieldError("phone", "skip"), null);
  });

  it("masks contact details in chat text", () => {
    assert.equal(maskEmail("alex@example.com"), "al***@example.com");
    assert.equal(maskPhone("425-555-0100"), "***-***-0100");
    const masked = maskContactText(
      "Reach me at alex@example.com or 425-555-0100",
    );
    assert.doesNotMatch(masked, /alex@example\.com/);
    assert.doesNotMatch(masked, /425-555-0100/);
    assert.match(masked, /al\*\*\*@example\.com/);
    assert.match(masked, /\*\*\*-\*\*\*-0100/);
  });

  it("formats masked contact lines and supports skip phrasing", () => {
    assert.equal(wantsToSkipPhone("skip"), true);
    assert.equal(wantsToSkipPhone("I prefer email"), true);
    assert.match(
      formatMaskedContactLine({
        customerName: "Alex Customer",
        customerEmail: "alex@example.com",
        customerPhone: "",
        phoneSkipped: true,
      }),
      /phone skipped/i,
    );
    assert.match(CONTACT_PRIVACY_NOTICE, /follow up about this inquiry/i);
    assert.equal(
      inputConfigForContactField("email").placeholder,
      "Enter your email address",
    );
    assert.equal(inputConfigForContactField("phone").type, "tel");
  });
});
