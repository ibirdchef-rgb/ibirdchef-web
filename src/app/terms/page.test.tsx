import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import TermsPage from "./page";

describe("Terms of Use page", () => {
  it("states Washington governing law and removes stale placeholder notices", () => {
    const html = renderToStaticMarkup(<TermsPage />);

    assert.match(html, /Terms of Use/);
    assert.match(html, /Washington State/);
    assert.match(html, /applicable California rights and requirements will be honored/i);
    assert.equal(html.includes("must be approved by ANS Corporation"), false);
    assert.equal(html.includes("Placeholders are intentional"), false);
    assert.equal(html.includes("[OWNER REQUIRED:"), false);
    assert.equal(html.includes("ANS_GOVERNING_JURISDICTION"), false);
  });
});
