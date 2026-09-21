import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  emptyEventInquiry,
  isUpcomingEventDate,
  validateEventInquiry,
  type EventInquiry,
} from "./event-inquiry";

const validInquiry: EventInquiry = emptyEventInquiry({
  name: "Alex Client",
  email: "alex@example.com",
  phone: "(425) 555-0100",
  serviceRegion: "seattle",
  eventCategory: "corporate",
  eventType: "Workplace lunch",
  eventTime: "12:00",
  guestCount: "40",
  eventCity: "Bellevue",
  venueOrZip: "98004",
  eventLocation: "Bellevue · 98004",
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
});

function toDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const today = new Date();
const todayStr = toDateOnly(today);

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = toDateOnly(tomorrow);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = toDateOnly(yesterday);

describe("isUpcomingEventDate", () => {
  it("accepts today", () => {
    assert.equal(isUpcomingEventDate(todayStr), true);
  });

  it("accepts a future date", () => {
    assert.equal(isUpcomingEventDate(tomorrowStr), true);
    assert.equal(isUpcomingEventDate("2099-01-01"), true);
  });

  it("rejects yesterday", () => {
    assert.equal(isUpcomingEventDate(yesterdayStr), false);
  });

  it("rejects a clearly past epoch-style date", () => {
    assert.equal(isUpcomingEventDate("1970-05-31"), false);
  });

  it("rejects malformed strings", () => {
    assert.equal(isUpcomingEventDate("asdf"), false);
    assert.equal(isUpcomingEventDate(""), false);
    assert.equal(isUpcomingEventDate("2026-9-1"), false);
    assert.equal(isUpcomingEventDate("09/01/2026"), false);
    assert.equal(isUpcomingEventDate("2026-09-01T00:00:00Z"), false);
  });

  it("rejects impossible calendar dates instead of normalizing them", () => {
    // Native `new Date("2026-02-31")`-style parsing would otherwise roll
    // this forward into March; it must be rejected outright instead.
    assert.equal(isUpcomingEventDate("2026-02-31"), false);
    assert.equal(isUpcomingEventDate("2026-13-01"), false);
    assert.equal(isUpcomingEventDate("2026-00-10"), false);
    assert.equal(isUpcomingEventDate("2026-04-31"), false);
  });

  it("respects an injected reference date for deterministic 'today' comparisons", () => {
    const reference = { year: 2026, month: 6, day: 15 };
    assert.equal(isUpcomingEventDate("2026-06-15", reference), true);
    assert.equal(isUpcomingEventDate("2026-06-16", reference), true);
    assert.equal(isUpcomingEventDate("2026-06-14", reference), false);
  });
});

describe("validateEventInquiry eventDate handling", () => {
  it("accepts an ordinary inquiry with today's date and forwards successfully", () => {
    const result = validateEventInquiry({ ...validInquiry, eventDate: todayStr });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.inquiry.eventDate, todayStr);
    }
  });

  it("accepts an ordinary inquiry with a future date", () => {
    const result = validateEventInquiry({ ...validInquiry, eventDate: tomorrowStr });
    assert.equal(result.ok, true);
  });

  it("rejects yesterday", () => {
    const result = validateEventInquiry({ ...validInquiry, eventDate: yesterdayStr });
    assert.equal(result.ok, false);
  });

  it("rejects the production 1970-05-31 symptom", () => {
    const result = validateEventInquiry({ ...validInquiry, eventDate: "1970-05-31" });
    assert.equal(result.ok, false);
  });

  it("rejects a malformed date string", () => {
    const result = validateEventInquiry({ ...validInquiry, eventDate: "asdf" });
    assert.equal(result.ok, false);
  });

  it("rejects an impossible calendar date", () => {
    const result = validateEventInquiry({ ...validInquiry, eventDate: "2026-02-31" });
    assert.equal(result.ok, false);
  });
});
