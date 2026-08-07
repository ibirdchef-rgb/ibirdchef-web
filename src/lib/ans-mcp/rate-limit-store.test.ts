import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  RATE_LIMIT_INCR_EXPIRE_SCRIPT,
  SHARED_RATE_LIMIT_STORE_TIMEOUT_MS,
  buildRateLimitIncrExpireCommand,
  createMemoryRateLimitStore,
  createRestRateLimitStore,
  getSharedRateLimitRestConfig,
  getSharedRateLimitStoreTimeoutMs,
  requiresSharedRateLimitStore,
  resetRateLimitStoreCache,
  resolveRateLimitStore,
  setRateLimitStoreForTests,
  setSharedRateLimitStoreTimeoutForTests,
} from "./rate-limit-store";
import { checkRateLimit, resetRateLimitBuckets } from "./security";

const originalFetch = globalThis.fetch;

afterEach(() => {
  setRateLimitStoreForTests(null);
  resetRateLimitStoreCache();
  setSharedRateLimitStoreTimeoutForTests(null);
  resetRateLimitBuckets();
  globalThis.fetch = originalFetch;
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

describe("atomic shared rate-limit INCR + EXPIRE", () => {
  it("builds a single EVAL command that increments and expires on first hit", () => {
    const command = buildRateLimitIncrExpireCommand("ans-mcp:rl:auth:client:1", 61);
    assert.equal(command[0], "EVAL");
    assert.equal(command[1], RATE_LIMIT_INCR_EXPIRE_SCRIPT);
    assert.match(command[1], /INCR/);
    assert.match(command[1], /EXPIRE/);
    assert.equal(command[2], "1");
    assert.equal(command[3], "ans-mcp:rl:auth:client:1");
    assert.equal(command[4], "61");
  });

  it("performs increment and initial expiry atomically in one REST call", async () => {
    const calls: Array<{
      url: string;
      body: string;
      auth: string | null;
      hasAbortSignal: boolean;
    }> = [];
    let nextCount = 0;
    globalThis.fetch = (async (input, init) => {
      nextCount += 1;
      const url = String(input);
      const body = String(init?.body ?? "");
      const headers = new Headers(init?.headers);
      calls.push({
        url,
        body,
        auth: headers.get("authorization"),
        hasAbortSignal: Boolean(init?.signal),
      });
      return new Response(JSON.stringify({ result: nextCount }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }) as typeof fetch;

    const store = createRestRateLimitStore({
      url: "https://kv.example.invalid",
      token: "kv-token-secret",
    });
    const windowMs = 60_000;
    const first = await store.touch("auth", "client-a", windowMs, 1_000);
    const second = await store.touch("auth", "client-a", windowMs, 1_500);

    assert.equal(first.count, 1);
    assert.equal(second.count, 2);
    assert.equal(first.resetAt, second.resetAt);
    assert.equal(calls.length, 2);
    assert.equal(getSharedRateLimitStoreTimeoutMs(), SHARED_RATE_LIMIT_STORE_TIMEOUT_MS);
    for (const call of calls) {
      assert.equal(call.url, "https://kv.example.invalid");
      assert.equal(call.url.includes("/incr/"), false);
      assert.equal(call.url.includes("/expire/"), false);
      assert.equal(call.hasAbortSignal, true);
      const parsed = JSON.parse(call.body) as unknown[];
      assert.equal(parsed[0], "EVAL");
      assert.match(String(parsed[1]), /INCR/);
      assert.match(String(parsed[1]), /EXPIRE/);
      assert.equal(parsed[3], "ans-mcp:rl:auth:client-a:0");
      assert.equal(String(call.body).includes("kv-token-secret"), false);
      assert.equal(call.auth, "Bearer kv-token-secret");
    }
  });

  it("supports complete Upstash pairs with the same atomic EVAL path", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example.invalid";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token-secret";
    const config = getSharedRateLimitRestConfig();
    assert.equal(config?.provider, "upstash");

    let sawEval = false;
    let sawAbortSignal = false;
    globalThis.fetch = (async (_input, init) => {
      const body = String(init?.body ?? "");
      sawEval = body.includes("EVAL") && body.includes("EXPIRE");
      sawAbortSignal = Boolean(init?.signal);
      return new Response(JSON.stringify({ result: 1 }), { status: 200 });
    }) as typeof fetch;

    const store = createRestRateLimitStore({
      url: config!.url,
      token: config!.token,
    });
    const touched = await store.touch("preauth", "client-b", 60_000, 2_000);
    assert.equal(touched.count, 1);
    assert.equal(sawEval, true);
    assert.equal(sawAbortSignal, true);
  });

  it("fails closed safely when the shared store returns an error", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: "ERR unavailable" }), {
        status: 200,
      })) as typeof fetch;

    const store = createRestRateLimitStore({
      url: "https://kv.example.invalid",
      token: "kv-token-secret",
    });
    await assert.rejects(
      () => store.touch("auth", "client-a", 60_000, 1_000),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message, "rate_limit_store_unavailable");
        assert.equal(error.message.includes("kv-token"), false);
        assert.equal(error.message.includes("example.invalid"), false);
        return true;
      },
    );
  });

  it("fails closed when the REST transport is unavailable", async () => {
    globalThis.fetch = (async () =>
      new Response("nope", { status: 503 })) as typeof fetch;

    const store = createRestRateLimitStore({
      url: "https://upstash.example.invalid",
      token: "upstash-token-secret",
    });
    await assert.rejects(() => store.touch("auth", "client-a", 60_000, 1_000), {
      message: "rate_limit_store_unavailable",
    });
  });

  it("times out stalled shared-store requests and fails closed safely", async () => {
    setSharedRateLimitStoreTimeoutForTests(40);
    assert.equal(getSharedRateLimitStoreTimeoutMs(), 40);

    let observedSignal: AbortSignal | null | undefined;
    globalThis.fetch = (async (_input, init) => {
      observedSignal = init?.signal;
      assert.ok(observedSignal, "expected abort deadline on shared-store fetch");
      return await new Promise<Response>((_resolve, reject) => {
        const onAbort = () => {
          reject(new DOMException("The operation was aborted", "AbortError"));
        };
        if (observedSignal?.aborted) {
          onAbort();
          return;
        }
        observedSignal?.addEventListener("abort", onAbort, { once: true });
      });
    }) as typeof fetch;

    const store = createRestRateLimitStore({
      url: "https://kv.example.invalid",
      token: "kv-token-secret",
    });

    const started = Date.now();
    await assert.rejects(
      () => store.touch("auth", "client-a", 60_000, 1_000),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.message, "rate_limit_store_unavailable");
        assert.equal(error.message.includes("kv-token-secret"), false);
        assert.equal(error.message.includes("kv.example.invalid"), false);
        assert.equal(error.message.includes("AbortError"), false);
        return true;
      },
    );
    const elapsed = Date.now() - started;
    assert.ok(elapsed < 1_000, `timeout should be prompt, elapsed=${elapsed}ms`);
    assert.ok(observedSignal?.aborted, "abort signal should fire for stalled request");

    // Existing security path maps store failures to safe HTTP 503.
    process.env.ANS_MCP_REQUIRE_AUTH = "true";
    process.env.KV_REST_API_URL = "https://kv.example.invalid";
    process.env.KV_REST_API_TOKEN = "kv-token-secret";
    resetRateLimitStoreCache();
    setRateLimitStoreForTests(null);
    // Force the rest store path with the same stalled fetch.
    const resolved = resolveRateLimitStore();
    assert.equal(resolved.ok, true);
    if (resolved.ok) {
      assert.equal(resolved.kind, "rest");
    }
    const blocked = await checkRateLimit("client-timeout");
    assert.equal(blocked.ok, false);
    if (!blocked.ok) {
      assert.equal(blocked.status, 503);
      assert.equal(blocked.error.code, "rate_limit_unavailable");
      assert.equal(JSON.stringify(blocked).includes("kv-token-secret"), false);
      assert.equal(JSON.stringify(blocked).includes("kv.example.invalid"), false);
    }
  });
});
