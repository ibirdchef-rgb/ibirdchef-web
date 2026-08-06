import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import BusinessFitPrivacyPage from "./page";
import GlobalPrivacyPage from "../../privacy/page";
import {
  ANS_APPROVED_BUSINESS_ADDRESS_LINES,
  ANS_APPROVED_PRIVACY_CONTACT_EMAIL,
} from "@/lib/ans-mcp/owner-config";

describe("Business Fit privacy policy page", () => {
  it("renders approved privacy contact, address, retention, and law language", () => {
    const html = renderToStaticMarkup(<BusinessFitPrivacyPage />);

    assert.match(html, /Privacy Policy/);
    assert.match(html, new RegExp(ANS_APPROVED_PRIVACY_CONTACT_EMAIL));
    for (const line of ANS_APPROVED_BUSINESS_ADDRESS_LINES) {
      assert.match(html, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
    assert.match(html, /Washington State/);
    assert.match(html, /applicable California rights and requirements will be honored/i);
    assert.match(html, /maximum standard retention period of 90 days/i);
    assert.match(html, /simulate_event_profit/);
    assert.match(html, /Human approval is required before any commercial action/);
    assert.equal(html.includes("ANS_MCP_AUTH_TOKEN"), false);
    assert.equal(html.includes("KV_REST_API_TOKEN"), false);
    assert.equal(html.includes("UPSTASH_REDIS_REST_TOKEN"), false);
    assert.equal(html.includes("[OWNER REQUIRED:"), false);
  });
});

describe("Global iBirdChef privacy page remains separate", () => {
  it("keeps the catering privacy placeholder distinct from Business Fit", () => {
    const html = renderToStaticMarkup(<GlobalPrivacyPage />);
    assert.match(html, /Privacy Policy/);
    assert.match(html, /not published yet/i);
    assert.equal(html.includes("ANS Food Business Fit"), false);
    assert.equal(html.includes("simulate_event_profit"), false);
    assert.equal(html.includes("ANS_MCP_AUTH_TOKEN"), false);
  });
});
