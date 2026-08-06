/**
 * Shared rate-limit store for production MCP.
 * Uses Vercel KV / Upstash Redis REST (no SDK dependency).
 * Never log URL or token values.
 */

export type RateLimitTouchResult = {
  count: number;
  resetAt: number;
};

export type RateLimitStore = {
  touch(
    bucket: string,
    clientKey: string,
    windowMs: number,
    now?: number,
  ): Promise<RateLimitTouchResult>;
};

type MemoryBucket = { count: number; resetAt: number };

export function createMemoryRateLimitStore(): RateLimitStore {
  const buckets = new Map<string, MemoryBucket>();
  return {
    async touch(bucket, clientKey, windowMs, now = Date.now()) {
      const key = `${bucket}:${clientKey}`;
      const existing = buckets.get(key);
      if (!existing || now >= existing.resetAt) {
        const resetAt = now + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return { count: 1, resetAt };
      }
      existing.count += 1;
      return { count: existing.count, resetAt: existing.resetAt };
    },
  };
}

export type SharedRateLimitProvider = "kv" | "upstash";

export type SharedRateLimitRestConfig = {
  url: string;
  token: string;
  provider: SharedRateLimitProvider;
};

/**
 * Select shared-store credentials as complete matching pairs only.
 * Never combine a URL from one provider with a token from the other.
 * If both complete pairs exist, prefer the Vercel KV pair deterministically.
 */
export function getSharedRateLimitRestConfig(): SharedRateLimitRestConfig | null {
  const kvUrl = process.env.KV_REST_API_URL?.trim() || "";
  const kvToken = process.env.KV_REST_API_TOKEN?.trim() || "";
  if (kvUrl && kvToken) {
    return {
      url: kvUrl.replace(/\/$/, ""),
      token: kvToken,
      provider: "kv",
    };
  }

  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL?.trim() || "";
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";
  if (upstashUrl && upstashToken) {
    return {
      url: upstashUrl.replace(/\/$/, ""),
      token: upstashToken,
      provider: "upstash",
    };
  }

  return null;
}

/**
 * Shared storage is mandatory whenever the public MCP endpoint enforces auth:
 * - Vercel Production (`VERCEL_ENV=production`), or
 * - Explicit auth (`ANS_MCP_REQUIRE_AUTH=true`), including authenticated
 *   non-Vercel hosts and authenticated Vercel Preview deployments.
 * Local unauthenticated development may use the in-memory limiter.
 */
export function requiresSharedRateLimitStore(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.ANS_MCP_REQUIRE_AUTH === "true"
  );
}

const SHARED_STORE_UNAVAILABLE_MESSAGE =
  "Shared rate-limit store is not configured for this authenticated MCP deployment.";

async function restCommand(
  config: { url: string; token: string },
  pathAndQuery: string,
): Promise<unknown> {
  const response = await fetch(`${config.url}${pathAndQuery}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.token}`,
    },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("rate_limit_store_unavailable");
  }
  const payload = (await response.json()) as { result?: unknown };
  return payload.result;
}

export function createRestRateLimitStore(config: {
  url: string;
  token: string;
}): RateLimitStore {
  return {
    async touch(bucket, clientKey, windowMs, now = Date.now()) {
      const windowId = Math.floor(now / windowMs);
      const key = `ans-mcp:rl:${bucket}:${clientKey}:${windowId}`;
      const encodedKey = encodeURIComponent(key);
      const countRaw = await restCommand(config, `/incr/${encodedKey}`);
      const count = Number(countRaw);
      if (!Number.isFinite(count) || count < 1) {
        throw new Error("rate_limit_store_unavailable");
      }
      if (count === 1) {
        const ttlSeconds = Math.max(1, Math.ceil(windowMs / 1000) + 1);
        await restCommand(config, `/expire/${encodedKey}/${ttlSeconds}`);
      }
      return {
        count,
        resetAt: (windowId + 1) * windowMs,
      };
    },
  };
}

let testStoreOverride: RateLimitStore | null = null;
let cachedStore: RateLimitStore | null = null;
let cachedStoreKind: "memory" | "rest" | "unavailable" | null = null;

/** Test helper — inject a store or clear override. */
export function setRateLimitStoreForTests(store: RateLimitStore | null): void {
  testStoreOverride = store;
  cachedStore = null;
  cachedStoreKind = null;
}

export function resetRateLimitStoreCache(): void {
  cachedStore = null;
  cachedStoreKind = null;
}

/**
 * Resolve the active store.
 * Authenticated deployments require a shared REST store; local unauthenticated
 * development/tests may use memory.
 */
export function resolveRateLimitStore():
  | { ok: true; store: RateLimitStore; kind: "memory" | "rest" }
  | { ok: false; kind: "unavailable"; error: string } {
  if (testStoreOverride) {
    return { ok: true, store: testStoreOverride, kind: "memory" };
  }

  if (cachedStore && cachedStoreKind === "memory") {
    return { ok: true, store: cachedStore, kind: "memory" };
  }
  if (cachedStore && cachedStoreKind === "rest") {
    return { ok: true, store: cachedStore, kind: "rest" };
  }
  if (cachedStoreKind === "unavailable") {
    return {
      ok: false,
      kind: "unavailable",
      error: SHARED_STORE_UNAVAILABLE_MESSAGE,
    };
  }

  const requireShared = requiresSharedRateLimitStore();
  const restConfig = getSharedRateLimitRestConfig();

  if (requireShared) {
    if (!restConfig) {
      cachedStoreKind = "unavailable";
      return {
        ok: false,
        kind: "unavailable",
        error: SHARED_STORE_UNAVAILABLE_MESSAGE,
      };
    }
    cachedStore = createRestRateLimitStore(restConfig);
    cachedStoreKind = "rest";
    return { ok: true, store: cachedStore, kind: "rest" };
  }

  cachedStore = createMemoryRateLimitStore();
  cachedStoreKind = "memory";
  return { ok: true, store: cachedStore, kind: "memory" };
}
