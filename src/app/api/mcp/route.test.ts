import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GET } from "./route";

describe("GET /api/mcp", () => {
  it("returns HTTP 405 with Allow: POST, DELETE", async () => {
    const response = await GET();
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST, DELETE");
    const body = (await response.json()) as {
      ok: boolean;
      error: { code: string };
    };
    assert.equal(body.ok, false);
    assert.equal(body.error.code, "method_not_allowed");
  });
});
