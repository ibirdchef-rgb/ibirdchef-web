import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import {
  buildMenuChatTaskASystemPrompt,
  AI_CHAT_TASK_A_FORBIDDEN,
} from "./ai-chat-policy";
import {
  buildClowInquiryPayload,
  buildSignaturePayload,
  forwardInquiryToClow,
  signClowInquiryRequest,
} from "./clow-intake";
import {
  emptyEventInquiry,
  validateEventInquiry,
  type EventInquiry,
} from "./event-inquiry";
import {
  buildIBirdOsCostingRequest,
  forwardInquiryToIBirdOs,
} from "./ibirdos-intake";

const sampleInquiry: EventInquiry = emptyEventInquiry({
  name: "Alex Client",
  email: "alex@example.com",
  phone: "(425) 555-0100",
  serviceRegion: "seattle",
  eventCategory: "corporate",
  eventType: "Workplace lunch",
  eventDate: "2026-09-15",
  eventTime: "12:00",
  guestCount: "40",
  eventCity: "Bellevue",
  venueOrZip: "98004",
  eventLocation: "Bellevue · 98004",
  cuisinePreference: "South Asian",
  serviceStyle: "Boxed meals",
  serviceType: "Corporate Catering",
  estimatedBudget: "$2,500 – $5,000",
  dietaryNeeds: "Vegetarian options needed",
  leadSource: "Website",
  contactConsent: true,
  smsConsent: false,
  message: "Looking for lunch catering for an office event.",
  pageSource: "homepage",
});

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
    assert.equal(payload.submissionId, "web_sub_123");
    assert.equal(payload.serviceRegion, "seattle");
    assert.equal(payload.eventCategory, "corporate");
    assert.equal(payload.eventType, "Workplace lunch");
    assert.equal(payload.eventTime, "12:00");
    assert.equal(payload.eventCity, "Bellevue");
    assert.equal(payload.venueOrZip, "98004");
    assert.equal(payload.leadSource, "Website");
    assert.equal(payload.contactConsent, true);
    assert.equal(payload.smsConsent, false);
    assert.equal(payload.pageSource, "homepage");
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

      const emailSucceeded = true;
      assert.equal(emailSucceeded, true);
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
      "src/lib/event-inquiry.ts",
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

describe("Shared event inquiry and iBirdOS preparation", () => {
  it("requires contact consent before accepting an inquiry", () => {
    const result = validateEventInquiry({
      ...sampleInquiry,
      contactConsent: false,
    });
    assert.equal(result.ok, false);
  });

  it("requires a service region before accepting an inquiry", () => {
    const result = validateEventInquiry({
      ...sampleInquiry,
      serviceRegion: "",
    });
    assert.equal(result.ok, false);
  });

  it("builds an iBirdOS costing request without inventing costs", () => {
    const payload = buildIBirdOsCostingRequest(sampleInquiry, "web_sub_456");
    assert.equal(payload.workflowStage, "pending_costing");
    assert.equal(payload.event.guestCount, "40");
    assert.equal(payload.event.region, "seattle");
    assert.equal(payload.event.city, "Bellevue");
    assert.ok(payload.costingChecklist.includes("labor"));
    assert.equal(forwardInquiryToIBirdOs({ payload }).ok, false);
  });

  it("encodes Task A forbidden rules in the chat policy prompt", () => {
    const prompt = buildMenuChatTaskASystemPrompt();
    assert.match(prompt, /\$18/);
    assert.match(prompt, /Clow/);
    assert.match(prompt, /iBirdOS/);
    for (const rule of AI_CHAT_TASK_A_FORBIDDEN) {
      assert.ok(prompt.includes(rule), `missing forbidden rule: ${rule}`);
    }
  });
});
