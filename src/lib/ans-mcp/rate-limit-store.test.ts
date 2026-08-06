import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
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

  it("fails closed in production without contacting a live store", () => {
    process.env.VERCEL_ENV = "production";
    assert.equal(requiresSharedRateLimitStore(), true);
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, false);
    if (!resolved.ok) {
      assert.equal(resolved.kind, "unavailable");
    }
  });
});
