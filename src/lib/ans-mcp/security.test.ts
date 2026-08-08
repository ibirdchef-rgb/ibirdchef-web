import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  createMemoryRateLimitStore,
  requiresSharedRateLimitStore,
  resolveRateLimitStore,
  setRateLimitStoreForTests,
} from "./rate-limit-store";
import {
  MCP_MAX_BODY_BYTES,
  checkAuth,
  checkContentLength,
  checkPreAuthRateLimit,
  checkRateLimit,
  getClientKey,
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
  delete process.env.ANS_MCP_TRUST_PROXY;
  delete process.env.ANS_MCP_TRUSTED_CLIENT_HEADER;
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  process.env.NODE_ENV = originalNodeEnv;
});

describe("ANS MCP security guards", () => {
  it("rate limits repeated clients", async () => {
    process.env.ANS_MCP_RATE_LIMIT_MAX = "3";
    assert.equal((await checkRateLimit("client-a")).ok, true);
    assert.equal((await checkRateLimit("client-a")).ok, true);
    assert.equal((await checkRateLimit("client-a")).ok, true);
    const blocked = await checkRateLimit("client-a");
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 429);
      assert.equal(blocked.error.code, "rate_limited");
    }
  });

  it("rate limits pre-auth attempts independently by client and recovers", async () => {
    process.env.ANS_MCP_PRE_AUTH_RATE_LIMIT_MAX = "2";
    const start = 1_000;

    assert.equal((await checkPreAuthRateLimit("client-a", start)).ok, true);
    assert.equal((await checkPreAuthRateLimit("client-a", start)).ok, true);
    const blocked = await checkPreAuthRateLimit("client-a", start);
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.equal(blocked.status, 429);

    assert.equal((await checkPreAuthRateLimit("client-b", start)).ok, true);
    assert.equal(
      (await checkPreAuthRateLimit("client-a", start + 60_000)).ok,
      true,
    );
  });

  it("keeps pre-auth and authenticated rate-limit buckets separate", async () => {
    process.env.ANS_MCP_PRE_AUTH_RATE_LIMIT_MAX = "1";
    process.env.ANS_MCP_RATE_LIMIT_MAX = "1";
    assert.equal((await checkPreAuthRateLimit("client-a")).ok, true);
    assert.equal((await checkRateLimit("client-a")).ok, true);
  });

  it("fails closed in production when shared rate-limit store is unavailable", async () => {
    process.env.VERCEL_ENV = "production";
    assert.equal(requiresSharedRateLimitStore(), true);
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, false);

    const blocked = await checkRateLimit("client-a");
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 503);
      assert.equal(blocked.error.code, "rate_limit_unavailable");
    }
  });

  it("fails closed when ANS_MCP_REQUIRE_AUTH enforces shared rate-limit storage", async () => {
    delete process.env.VERCEL_ENV;
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    assert.equal(requiresSharedRateLimitStore(), true);
    const blocked = await checkRateLimit("client-a");
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 503);
      assert.equal(blocked.error.code, "rate_limit_unavailable");
      assert.equal(JSON.stringify(blocked).includes("KV_REST_API"), false);
    }
  });

  it("uses an injectable store in tests without a live service", async () => {
    process.env.VERCEL_ENV = "production";
    process.env.ANS_MCP_RATE_LIMIT_MAX = "1";
    setRateLimitStoreForTests(createMemoryRateLimitStore());
    assert.equal((await checkRateLimit("client-a")).ok, true);
    const blocked = await checkRateLimit("client-a");
    assert.equal(blocked.ok, false);
    if (!blocked.ok) assert.equal(blocked.status, 429);
  });

  it("ignores spoofable forwarded IP headers outside the Vercel boundary when proxy trust is not configured", () => {
    delete process.env.VERCEL;
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    delete process.env.ANS_MCP_TRUST_PROXY;
    delete process.env.ANS_MCP_TRUSTED_CLIENT_HEADER;
    const req = new Request("http://localhost/api/mcp", {
      headers: {
        "x-vercel-forwarded-for": "1.2.3.4",
        "x-real-ip": "5.6.7.8",
        "x-forwarded-for": "9.9.9.9",
      },
    });
    assert.equal(getClientKey(req), "unknown");
  });

  it("uses Vercel forwarded IP headers only on the Vercel boundary", () => {
    process.env.VERCEL = "1";
    const req = new Request("http://localhost/api/mcp", {
      headers: { "x-vercel-forwarded-for": "1.2.3.4, 10.0.0.1" },
    });
    assert.equal(getClientKey(req), "1.2.3.4");
  });

  it("derives separate stable client keys from a configured non-Vercel trusted proxy header", () => {
    delete process.env.VERCEL;
    process.env.ANS_MCP_TRUST_PROXY = "true";
    process.env.ANS_MCP_TRUSTED_CLIENT_HEADER = "x-real-ip";

    const clientA = getClientKey(
      new Request("http://localhost/api/mcp", {
        headers: { "x-real-ip": "10.0.0.1", "x-forwarded-for": "spoofed" },
      }),
    );
    const clientB = getClientKey(
      new Request("http://localhost/api/mcp", {
        headers: { "x-real-ip": "10.0.0.2", "x-forwarded-for": "spoofed" },
      }),
    );
    assert.equal(clientA, "10.0.0.1");
    assert.equal(clientB, "10.0.0.2");
    assert.notEqual(clientA, clientB);
  });

  it("does not trust spoofable headers when trust proxy is only partially configured", () => {
    delete process.env.VERCEL;
    process.env.ANS_MCP_TRUST_PROXY = "true";
    // Header name missing / not allowlisted → safe fallback
    process.env.ANS_MCP_TRUSTED_CLIENT_HEADER = "x-evil-spoof";
    const req = new Request("http://localhost/api/mcp", {
      headers: {
        "x-evil-spoof": "1.2.3.4",
        "x-forwarded-for": "9.9.9.9",
      },
    });
    assert.equal(getClientKey(req), "unknown");
    assert.equal(JSON.stringify({ key: getClientKey(req) }).includes("ANS_MCP"), false);
  });

  it("keeps separate rate-limit buckets for different trusted non-Vercel clients", async () => {
    delete process.env.VERCEL;
    process.env.ANS_MCP_TRUST_PROXY = "true";
    process.env.ANS_MCP_TRUSTED_CLIENT_HEADER = "x-forwarded-for";
    process.env.ANS_MCP_RATE_LIMIT_MAX = "1";

    const keyA = getClientKey(
      new Request("http://localhost/api/mcp", {
        headers: { "x-forwarded-for": "203.0.113.10" },
      }),
    );
    const keyB = getClientKey(
      new Request("http://localhost/api/mcp", {
        headers: { "x-forwarded-for": "203.0.113.20" },
      }),
    );
    assert.equal((await checkRateLimit(keyA)).ok, true);
    assert.equal((await checkRateLimit(keyB)).ok, true);
    const blockedA = await checkRateLimit(keyA);
    assert.equal(blockedA.ok, false);
    if (!blockedA.ok) {
      assert.equal(blockedA.status, 429);
      assert.equal(JSON.stringify(blockedA).includes("203.0.113"), false);
      assert.equal(JSON.stringify(blockedA).includes("ANS_MCP_TRUST"), false);
    }
    assert.equal((await checkRateLimit(keyB)).ok, false);
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
