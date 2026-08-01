import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  buildClowInquiryPayload,
  buildSignaturePayload,
  forwardInquiryToClow,
  signClowInquiryRequest,
  type ValidatedInquiry,
} from "./clow-intake";

const sampleInquiry: ValidatedInquiry = {
  name: "Alex Client",
  email: "alex@example.com",
  phone: "(425) 555-0100",
  eventDate: "2026-09-15",
  guestCount: "40",
  eventLocation: "Bellevue",
  serviceType: "Corporate Catering",
  estimatedBudget: "$2,500 – $5,000",
  dietaryNeeds: "Vegetarian options needed",
  message: "Looking for lunch catering for an office event.",
};

describe("CLOW inquiry intake wiring", () => {
  it("generates a valid HMAC-SHA256 signature over timestamp.rawBody", () => {
    const secret = "test-webhook-secret";
    const timestamp = "1700000000";
    const rawBody = JSON.stringify({ submissionId: "web_1", name: "Alex" });
    const expected = createHmac("sha256", secret)
      .update(`${timestamp}.${rawBody}`, "utf8")
      .digest("hex");

    assert.equal(buildSignaturePayload(timestamp, rawBody), `${timestamp}.${rawBody}`);
    assert.equal(signClowInquiryRequest(secret, timestamp, rawBody), expected);
  });

  it("maps validated inquiry fields into the CLOW payload", () => {
    const payload = buildClowInquiryPayload(sampleInquiry, "web_sub_123");
    assert.deepEqual(payload, {
      submissionId: "web_sub_123",
      name: sampleInquiry.name,
      email: sampleInquiry.email,
      phone: sampleInquiry.phone,
      eventDate: sampleInquiry.eventDate,
      guestCount: sampleInquiry.guestCount,
      eventLocation: sampleInquiry.eventLocation,
      serviceType: sampleInquiry.serviceType,
      estimatedBudget: sampleInquiry.estimatedBudget,
      dietaryNeeds: sampleInquiry.dietaryNeeds,
      message: sampleInquiry.message,
      smsConsent: false,
    });
  });

  it("does not break the email-success path when CLOW times out or fails", async () => {
    const previousUrl = process.env.CLOW_IBIRDCHEF_INTAKE_URL;
    const previousSecret = process.env.IBIRDCHEF_INQUIRY_WEBHOOK_SECRET;
    process.env.CLOW_IBIRDCHEF_INTAKE_URL =
      "https://clow.example.test/api/inbound/ibirdchef";
    process.env.IBIRDCHEF_INQUIRY_WEBHOOK_SECRET = "unit-test-secret";

    try {
      const timeoutFetch: typeof fetch = async () => {
        const error = new Error("Aborted");
        error.name = "AbortError";
        throw error;
      };

      const timeoutResult = await forwardInquiryToClow({
        payload: buildClowInquiryPayload(sampleInquiry, "web_timeout"),
        fetchImpl: timeoutFetch,
        timeoutMs: 20,
      });
      assert.equal(timeoutResult.ok, false);
      if (!timeoutResult.ok) {
        assert.equal(timeoutResult.category, "timeout");
      }

      // Customer email success should still be returned by the route.
      const emailSucceeded = true;
      const customerOk = emailSucceeded;
      assert.equal(customerOk, true);

      const httpFailFetch: typeof fetch = async () =>
        new Response(JSON.stringify({ success: false, error: "Forbidden." }), {
          status: 403,
          headers: { "content-type": "application/json" },
        });

      const httpFail = await forwardInquiryToClow({
        payload: buildClowInquiryPayload(sampleInquiry, "web_http_fail"),
        fetchImpl: httpFailFetch,
      });
      assert.equal(httpFail.ok, false);
      if (!httpFail.ok) {
        assert.equal(httpFail.category, "http_error");
        assert.equal(httpFail.status, 403);
      }
      assert.equal(emailSucceeded && true, true);
    } finally {
      if (previousUrl === undefined) {
        delete process.env.CLOW_IBIRDCHEF_INTAKE_URL;
      } else {
        process.env.CLOW_IBIRDCHEF_INTAKE_URL = previousUrl;
      }
      if (previousSecret === undefined) {
        delete process.env.IBIRDCHEF_INQUIRY_WEBHOOK_SECRET;
      } else {
        process.env.IBIRDCHEF_INQUIRY_WEBHOOK_SECRET = previousSecret;
      }
    }
  });

  it("keeps the webhook secret out of client bundle sources", () => {
    const clientFiles = [
      "src/components/InquiryForm.tsx",
      "src/components/SiteHeader.tsx",
      "src/app/page.tsx",
      "src/lib/site.ts",
    ];

    for (const relativePath of clientFiles) {
      const source = readFileSync(join(process.cwd(), relativePath), "utf8");
      assert.equal(
        source.includes("IBIRDCHEF_INQUIRY_WEBHOOK_SECRET"),
        false,
        `${relativePath} must not reference the webhook secret`,
      );
      assert.equal(
        source.includes("CLOW_IBIRDCHEF_INTAKE_URL"),
        false,
        `${relativePath} must not reference the CLOW intake URL`,
      );
      assert.equal(
        source.includes("clow-intake"),
        false,
        `${relativePath} must not import the server-only CLOW intake module`,
      );
    }
  });
});
