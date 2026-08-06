import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  createMemoryRateLimitStore,
  getSharedRateLimitRestConfig,
  requiresSharedRateLimitStore,
  resetRateLimitStoreCache,
  resolveRateLimitStore,
  setRateLimitStoreForTests,
} from "./rate-limit-store";

afterEach(() => {
  setRateLimitStoreForTests(null);
  resetRateLimitStoreCache();
  delete process.env.VERCEL_ENV;
  delete process.env.VERCEL;
  delete process.env.ANS_MCP_REQUIRE_AUTH;
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe("shared rate-limit credential pairs", () => {
  it("accepts a complete KV pair", () => {
    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    process.env.KV_REST_API_TOKEN = "kv-token";
    const config = getSharedRateLimitRestConfig();
    assert.equal(config?.provider, "kv");
    assert.equal(config?.url, "https://kv.example.invalid");
    assert.equal(config?.token, "kv-token");
  });

  it("accepts a complete Upstash pair", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.invalid";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
    const config = getSharedRateLimitRestConfig();
    assert.equal(config?.provider, "upstash");
    assert.equal(config?.url, "https://upstash.example.invalid");
    assert.equal(config?.token, "upstash-token");
  });

  it("rejects a partial KV pair", () => {
    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    delete process.env.KV_REST_API_TOKEN;
    assert.equal(getSharedRateLimitRestConfig(), null);
  });

  it("rejects a partial Upstash pair", () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.invalid";
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.equal(getSharedRateLimitRestConfig(), null);
  });

  it("never mixes URL and token across providers", () => {
    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    // Missing KV token; complete Upstash pair must win intact.
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.invalid";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
    const config = getSharedRateLimitRestConfig();
    assert.equal(config?.provider, "upstash");
    assert.equal(config?.url, "https://upstash.example.invalid");
    assert.equal(config?.token, "upstash-token");
  });

  it("prefers a complete KV pair when both providers are complete", () => {
    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    process.env.KV_REST_API_TOKEN = "kv-token";
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.invalid";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
    const config = getSharedRateLimitRestConfig();
    assert.equal(config?.provider, "kv");
    assert.equal(config?.url, "https://kv.example.invalid");
    assert.equal(config?.token, "kv-token");
  });

  it("returns null when no complete pair is configured", () => {
    assert.equal(getSharedRateLimitRestConfig(), null);
  });
});

describe("shared rate-limit enforcement gate", () => {
  it("requires shared storage in Vercel Production", () => {
    process.env.VERCEL_ENV = "production";
    assert.equal(requiresSharedRateLimitStore(), true);
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, false);
    if (!resolved.ok) {
      assert.equal(resolved.kind, "unavailable");
      assert.match(resolved.error, /Shared rate-limit store is not configured/i);
      assert.equal(resolved.error.includes("kv-token"), false);
      assert.equal(resolved.error.includes("UPSTASH"), false);
    }
  });

  it("requires shared storage when ANS_MCP_REQUIRE_AUTH=true outside Vercel", () => {
    delete process.env.VERCEL_ENV;
    delete process.env.VERCEL;
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    assert.equal(requiresSharedRateLimitStore(), true);
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, false);
    if (!resolved.ok) assert.equal(resolved.kind, "unavailable");
  });

  it("requires shared storage for authenticated Vercel Preview", () => {
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL = "1";
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    assert.equal(requiresSharedRateLimitStore(), true);
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, false);
    if (!resolved.ok) assert.equal(resolved.kind, "unavailable");
  });

  it("allows in-memory storage for local unauthenticated development", () => {
    delete process.env.VERCEL_ENV;
    delete process.env.ANS_MCP_REQUIRE_AUTH;
    assert.equal(requiresSharedRateLimitStore(), false);
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, true);
    if (resolved.ok) assert.equal(resolved.kind, "memory");
  });

  it("fails closed for missing shared credentials when auth is enforced", () => {
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, false);
    if (!resolved.ok) {
      assert.equal(resolved.kind, "unavailable");
      assert.equal(JSON.stringify(resolved).includes("example.invalid"), false);
    }
  });

  it("fails closed for partial and mixed credential pairs when auth is enforced", () => {
    process.env.ANS_MCP_REQUIRE_AUTH = "true";

    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    resetRateLimitStoreCache();
    assert.equal(resolveRateLimitStore().ok, false);

    delete process.env.KV_REST_API_URL;
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.invalid";
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    resetRateLimitStoreCache();
    assert.equal(resolveRateLimitStore().ok, false);

    // Mixed incomplete pairs: KV URL only + Upstash token only → no complete pair.
    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    delete process.env.KV_REST_API_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
    resetRateLimitStoreCache();
    assert.equal(getSharedRateLimitRestConfig(), null);
    assert.equal(resolveRateLimitStore().ok, false);
  });

  it("selects a complete KV or Upstash pair without contacting a live store", () => {
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    process.env.KV_REST_API_TOKEN = "kv-token";
    // Inject memory store so resolve succeeds without live network I/O.
    setRateLimitStoreForTests(createMemoryRateLimitStore());
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, true);

    setRateLimitStoreForTests(null);
    resetRateLimitStoreCache();
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.invalid";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";
    const config = getSharedRateLimitRestConfig();
    assert.equal(config?.provider, "upstash");
    setRateLimitStoreForTests(createMemoryRateLimitStore());
    assert.equal(resolveRateLimitStore().ok, true);
  });
});
