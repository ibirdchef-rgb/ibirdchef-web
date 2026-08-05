import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  MCP_MAX_BODY_BYTES,
  checkAuth,
  checkContentLength,
  checkPreAuthRateLimit,
  checkRateLimit,
  readLimitedBody,
  resetRateLimitBuckets,
  safeErrorResponse,
} from "./security";

const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  resetRateLimitBuckets();
  delete process.env.ANS_MCP_AUTH_TOKEN;
  delete process.env.ANS_MCP_REQUIRE_AUTH;
  delete process.env.ANS_MCP_RATE_LIMIT_MAX;
  delete process.env.ANS_MCP_PRE_AUTH_RATE_LIMIT_MAX;
  delete process.env.VERCEL_ENV;
  process.env.NODE_ENV = originalNodeEnv;
});


describe("ANS MCP security guards", () => {
  it("rate limits repeated clients", () => {
    process.env.ANS_MCP_RATE_LIMIT_MAX = "3";
    assert.equal(checkRateLimit("client-a").ok, true);
    assert.equal(checkRateLimit("client-a").ok, true);
    assert.equal(checkRateLimit("client-a").ok, true);
    const blocked = checkRateLimit("client-a");
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 429);
      assert.equal(blocked.error.code, "rate_limited");
    }
  });

  it("rate limits pre-auth attempts independently by client and recovers", () => {
    process.env.ANS_MCP_PRE_AUTH_RATE_LIMIT_MAX = "2";
    const start = 1_000;

    assert.equal(checkPreAuthRateLimit("client-a", start).ok, true);
    assert.equal(checkPreAuthRateLimit("client-a", start).ok, true);
    const blocked = checkPreAuthRateLimit("client-a", start);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.equal(blocked.status, 429);

    assert.equal(checkPreAuthRateLimit("client-b", start).ok, true);
    assert.equal(
      checkPreAuthRateLimit("client-a", start + 60_000).ok,
      true,
    );
  });

  it("keeps pre-auth and authenticated rate-limit buckets separate", () => {
    process.env.ANS_MCP_PRE_AUTH_RATE_LIMIT_MAX = "1";
    process.env.ANS_MCP_RATE_LIMIT_MAX = "1";
    assert.equal(checkPreAuthRateLimit("client-a").ok, true);
    assert.equal(checkRateLimit("client-a").ok, true);
  });

  it("requires bearer auth when enforced", () => {
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    process.env.ANS_MCP_AUTH_TOKEN = "test-token";
    const missing = checkAuth(new Request("http://localhost/api/mcp"));
    assert.equal(missing.ok, false);
    if (!missing.ok) assert.equal(missing.status, 401);

    const ok = checkAuth(
      new Request("http://localhost/api/mcp", {
        headers: { authorization: "Bearer test-token" },
      }),
    );
    assert.equal(ok.ok, true);
  });

  it("does not enforce auth from NODE_ENV=production alone", () => {
    process.env.NODE_ENV = "production";
    delete process.env.ANS_MCP_REQUIRE_AUTH;
    delete process.env.VERCEL_ENV;
    delete process.env.ANS_MCP_AUTH_TOKEN;
    assert.equal(checkAuth(new Request("http://localhost/api/mcp")).ok, true);
  });

  it("safeErrorResponse can include Retry-After", async () => {
    const response = safeErrorResponse(429, "rate_limited", "Too many requests.", {
      retryAfterSeconds: 12,
    });
    assert.equal(response.headers.get("retry-after"), "12");
  });

  it("rejects oversized content-length", () => {
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: { "content-length": String(MCP_MAX_BODY_BYTES + 1) },
      body: "x",
    });
    const result = checkContentLength(req);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 413);
  });

  it("readLimitedBody rejects oversized streamed payloads", async () => {
    const big = "a".repeat(MCP_MAX_BODY_BYTES + 10);
    const req = new Request("http://localhost/api/mcp", {
      method: "POST",
      body: big,
    });
    const result = await readLimitedBody(req);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 413);
      assert.equal(JSON.stringify(result).includes(big.slice(0, 40)), false);
    }
  });

  it("safeErrorResponse omits stack traces", () => {
    const response = safeErrorResponse(500, "internal_error", "Unable to process MCP request.");
    assert.equal(response.status, 500);
  });
});
