import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";

// The bot gate in route.ts runs before the RESEND_API_KEY config check, so
// none of these tests need a real (or mocked) email/CLOW/iBirdOS send —
// leaving those env vars unset makes any accidental fall-through fail loudly
// (503) instead of silently hitting a real network call.
delete process.env.RESEND_API_KEY;
delete process.env.INQUIRY_TO_EMAIL;
delete process.env.INQUIRY_FROM_EMAIL;
delete process.env.CLOW_IBIRDCHEF_INTAKE_URL;
delete process.env.IBIRDCHEF_INQUIRY_WEBHOOK_SECRET;

const { POST } = await import("./route");

const validBody = {
  name: "Alex Client",
  email: "alex@example.com",
  phone: "(425) 555-0100",
  serviceRegion: "seattle",
  eventCategory: "corporate",
  eventType: "Workplace lunch",
  eventDate: "2099-01-01",
  eventTime: "12:00",
  eventCity: "Bellevue",
  venueOrZip: "98004",
  eventLocation: "Bellevue · 98004",
  guestCount: "40",
  cuisinePreference: "South Asian",
  serviceStyle: "Boxed meals",
  serviceType: "Corporate Catering",
  estimatedBudget: "$2,500 – $5,000",
  dietaryNeeds: "",
  leadSource: "Website",
  contactConsent: true,
  smsConsent: false,
  message: "Looking for a workplace lunch caterer.",
  pageSource: "homepage",
};

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("https://ibirdchef.com/api/inquiry", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

// Capture console output during each test so we can assert nothing
// PII-bearing gets logged when a bot is blocked, without spamming test
// output.
let logs: Array<{ level: string; args: unknown[] }> = [];
let originalConsole: Pick<Console, "log" | "info" | "warn" | "error">;

before(() => {
  originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };
  for (const level of ["log", "info", "warn", "error"] as const) {
    console[level] = (...args: unknown[]) => {
      logs.push({ level, args });
    };
  }
});

after(() => {
  Object.assign(console, originalConsole);
});

beforeEach(() => {
  logs = [];
});

function allLoggedText(): string {
  return logs.map((entry) => entry.args.map((a) => JSON.stringify(a)).join(" ")).join("\n");
}

describe("POST /api/inquiry anti-bot gate", () => {
  it("passes a normal inquiry through the bot gate (no honeypot, no timing, or slow-enough timing)", async () => {
    // No formStartedAt at all: "missing timing metadata" case.
    const res = await POST(makeRequest({ ...validBody }));
    const data = await res.json();
    // Bot-blocked responses are always `{ ok: true }` with status 200 and
    // nothing else. A normal inquiry with no email config set instead falls
    // through to the (unrelated, pre-existing) 503 "not configured" branch —
    // proving it was NOT caught by the bot gate.
    assert.equal(res.status, 503);
    assert.equal(data.ok, undefined);
    assert.match(data.error, /not configured/i);
  });

  it("blocks a submission with a filled honeypot field, returning ok:true with no side effects", async () => {
    const res = await POST(
      makeRequest({
        ...validBody,
        companyWebsite: "https://totally-a-real-bot.example",
      }),
    );
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(data, { ok: true });
  });

  it("blocks a submission that arrives unrealistically fast (under ~2s)", async () => {
    const res = await POST(
      makeRequest({
        ...validBody,
        formStartedAt: Date.now() - 500, // 0.5s ago
      }),
    );
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(data, { ok: true });
  });

  it("allows a submission with missing timing metadata (backward compatibility)", async () => {
    const bodyWithoutTiming = { ...validBody };
    const res = await POST(makeRequest(bodyWithoutTiming));
    const data = await res.json();
    // Same as the first test: falls through to the pre-existing 503, proving
    // the bot gate did not block it for lacking formStartedAt.
    assert.equal(res.status, 503);
    assert.equal(data.ok, undefined);
  });

  it("allows a submission whose timing shows a realistically slow, human-paced fill", async () => {
    const res = await POST(
      makeRequest({
        ...validBody,
        formStartedAt: Date.now() - 30_000, // 30s ago
      }),
    );
    const data = await res.json();
    assert.equal(res.status, 503);
    assert.equal(data.ok, undefined);
  });

  it("does not treat a slightly-behind client clock (small negative elapsed) as suspiciously fast", async () => {
    const res = await POST(
      makeRequest({
        ...validBody,
        formStartedAt: Date.now() + 5_000, // client clock 5s ahead of server
      }),
    );
    const data = await res.json();
    assert.equal(res.status, 503);
    assert.equal(data.ok, undefined);
  });

  it("never logs customer PII (name, email, phone, message) when blocking a bot", async () => {
    await POST(
      makeRequest({
        ...validBody,
        name: "Very Unique Honeypot Name XYZ123",
        email: "unique-honeypot-marker@example.com",
        phone: "555-000-9999",
        message: "unique honeypot message marker",
        companyWebsite: "spam-value",
      }),
    );
    const text = allLoggedText();
    assert.ok(!text.includes("Very Unique Honeypot Name XYZ123"));
    assert.ok(!text.includes("unique-honeypot-marker@example.com"));
    assert.ok(!text.includes("555-000-9999"));
    assert.ok(!text.includes("unique honeypot message marker"));
  });

  it("does not require the honeypot field to be present at all", async () => {
    const { companyWebsite: _omit, ...bodyWithoutHoneypotKey } = {
      ...validBody,
      companyWebsite: undefined,
    } as Record<string, unknown>;
    void _omit;
    const res = await POST(makeRequest(bodyWithoutHoneypotKey));
    const data = await res.json();
    assert.equal(res.status, 503);
    assert.equal(data.ok, undefined);
  });
});
