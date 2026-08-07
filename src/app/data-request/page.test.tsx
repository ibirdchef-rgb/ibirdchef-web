import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import DataRequestPage from "./page";
import SupportPage from "../support/page";
import TermsPage from "../terms/page";
import BusinessFitPrivacyPage from "../business-fit/privacy/page";
import {
  ANS_APPROVED_SUPPORT_EMAIL,
  resolveSupportEmail,
} from "@/lib/ans-mcp/owner-config";

afterEach(() => {
  delete process.env.ANS_SUPPORT_EMAIL;
});

describe("Data request page support email", () => {
  it("renders the approved default support email", () => {
    delete process.env.ANS_SUPPORT_EMAIL;
    assert.equal(resolveSupportEmail(), ANS_APPROVED_SUPPORT_EMAIL);
    const html = renderToStaticMarkup(<DataRequestPage />);
    assert.match(html, new RegExp(ANS_APPROVED_SUPPORT_EMAIL));
    assert.match(html, /mailto:support@prosperityaxis\.com/);
  });

  it("renders a configured ANS_SUPPORT_EMAIL override", () => {
    process.env.ANS_SUPPORT_EMAIL = "support-override@example.com";
    assert.equal(resolveSupportEmail(), "support-override@example.com");

    const html = renderToStaticMarkup(<DataRequestPage />);
    assert.match(html, /support-override@example\.com/);
    assert.match(html, /mailto:support-override@example\.com/);
    assert.equal(html.includes(ANS_APPROVED_SUPPORT_EMAIL), false);
  });

  it("keeps /support, /terms, /business-fit/privacy, and /data-request consistent", () => {
    process.env.ANS_SUPPORT_EMAIL = "shared-support@example.com";
    const pages = [
      renderToStaticMarkup(<DataRequestPage />),
      renderToStaticMarkup(<SupportPage />),
      renderToStaticMarkup(<TermsPage />),
      renderToStaticMarkup(<BusinessFitPrivacyPage />),
    ];
    for (const html of pages) {
      assert.match(html, /shared-support@example\.com/);
      assert.equal(html.includes(ANS_APPROVED_SUPPORT_EMAIL), false);
    }
  });
});
