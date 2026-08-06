/**
 * Production MCP request guards: auth, size limits, rate limiting, safe errors.
 */

import { timingSafeEqual } from "node:crypto";
import {
  resetRateLimitStoreCache,
  resolveRateLimitStore,
  setRateLimitStoreForTests,
  type RateLimitStore,
} from "@/lib/ans-mcp/rate-limit-store";

export const MCP_MAX_BODY_BYTES = 64 * 1024; // 64 KiB
export const MCP_RATE_LIMIT_WINDOW_MS = 60_000;

export function getRateLimitMax(): number {
  const parsed = Number(process.env.ANS_MCP_RATE_LIMIT_MAX ?? "60");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

export function getPreAuthRateLimitMax(): number {
  const parsed = Number(process.env.ANS_MCP_PRE_AUTH_RATE_LIMIT_MAX ?? "30");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
}

export type SecurityFailure = {
  ok: false;
  status: number;
  error: {
    code: string;
    message: string;
  };
  retryAfterSeconds?: number;
};

export type SecuritySuccess = {
  ok: true;
};

/**
 * Trust platform client-IP headers only on the verified Vercel boundary.
 * Outside Vercel, ignore spoofable forwarded headers and collapse to one bucket.
 */
export function getClientKey(request: Request): string {
  const onVercel = Boolean(process.env.VERCEL);
  if (!onVercel) {
    return "unknown";
  }

  const vercelForwarded = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwarded) {
    return vercelForwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  return "unknown";
}

async function touchLimit(
  bucket: "auth" | "preauth",
  clientKey: string,
  max: number,
  now = Date.now(),
): Promise<SecuritySuccess | SecurityFailure> {
  const resolved = resolveRateLimitStore();
  if (!resolved.ok) {
    return {
      ok: false,
      status: 503,
      error: {
        code: "rate_limit_unavailable",
        message: resolved.error,
      },
    };
  }

  try {
    const touched = await resolved.store.touch(
      bucket,
      clientKey,
      MCP_RATE_LIMIT_WINDOW_MS,
      now,
    );
    // Align window end with store result; fall back to local window if needed.
    const resetAt = touched.resetAt || now + MCP_RATE_LIMIT_WINDOW_MS;
    if (touched.count > max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
      return {
        ok: false,
        status: 429,
        retryAfterSeconds,
        error: {
          code: "rate_limited",
          message: "Too many requests. Please retry later.",
        },
      };
    }
    return { ok: true };
  } catch {
    return {
      ok: false,
      status: 503,
      error: {
        code: "rate_limit_unavailable",
        message: "Rate-limit service is temporarily unavailable.",
      },
    };
  }
}

export async function checkRateLimit(
  clientKey: string,
  now = Date.now(),
): Promise<SecuritySuccess | SecurityFailure> {
  return touchLimit("auth", clientKey, getRateLimitMax(), now);
}

/**
 * Limits failed-auth traffic only. Authenticated traffic must use checkRateLimit.
 */
export async function checkPreAuthRateLimit(
  clientKey: string,
  now = Date.now(),
): Promise<SecuritySuccess | SecurityFailure> {
  return touchLimit("preauth", clientKey, getPreAuthRateLimitMax(), now);
}

/** Test helper — clear in-memory / cached store between tests. */
export function resetRateLimitBuckets(): void {
  setRateLimitStoreForTests(null);
  resetRateLimitStoreCache();
}

/** Test helper — inject a custom store. */
export function setRateLimitStore(store: RateLimitStore | null): void {
  setRateLimitStoreForTests(store);
}

function tokensEqual(presented: string, required: string): boolean {
  const a = Buffer.from(presented);
  const b = Buffer.from(required);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

export function checkAuth(request: Request): SecuritySuccess | SecurityFailure {
  const required = process.env.ANS_MCP_AUTH_TOKEN?.trim();
  // Enforce in Vercel Production or when explicitly required.
  // Do not treat local `next start` (NODE_ENV=production) as marketplace production.
  const enforce =
    process.env.ANS_MCP_REQUIRE_AUTH === "true" ||
    process.env.VERCEL_ENV === "production";

  if (!enforce) {
    return { ok: true };
  }

  if (!required) {
    return {
      ok: false,
      status: 503,
      error: {
        code: "auth_not_configured",
        message: "MCP authentication is not configured for this environment.",
      },
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const presented = match?.[1]?.trim() ?? "";
  if (!presented || !tokensEqual(presented, required)) {
    return {
      ok: false,
      status: 401,
      error: {
        code: "unauthorized",
        message: "Valid bearer token required.",
      },
    };
  }
  return { ok: true };
}

export function checkContentLength(request: Request): SecuritySuccess | SecurityFailure {
  const raw = request.headers.get("content-length");
  if (!raw) {
    return { ok: true };
  }
  const length = Number(raw);
  if (!Number.isFinite(length) || length < 0) {
    return {
      ok: false,
      status: 400,
      error: { code: "invalid_content_length", message: "Invalid Content-Length header." },
    };
  }
  if (length > MCP_MAX_BODY_BYTES) {
    return {
      ok: false,
      status: 413,
      error: {
        code: "payload_too_large",
        message: `Request body exceeds ${MCP_MAX_BODY_BYTES} bytes.`,
      },
    };
  }
  return { ok: true };
}

export async function readLimitedBody(request: Request): Promise<
  | { ok: true; text: string }
  | SecurityFailure
> {
  const lengthCheck = checkContentLength(request);
  if (!lengthCheck.ok) {
    return lengthCheck;
  }

  const reader = request.body?.getReader();
  if (!reader) {
    return { ok: true, text: "" };
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MCP_MAX_BODY_BYTES) {
      try {
        await reader.cancel();
      } catch {
        // ignore cancel errors
      }
      return {
        ok: false,
        status: 413,
        error: {
          code: "payload_too_large",
          message: `Request body exceeds ${MCP_MAX_BODY_BYTES} bytes.`,
        },
      };
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return { ok: true, text: new TextDecoder("utf-8").decode(merged) };
}

export function safeErrorResponse(
  status: number,
  code: string,
  message: string,
  options?: { retryAfterSeconds?: number; allow?: string },
): Response {
  const headers: Record<string, string> = {
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };
  if (options?.retryAfterSeconds) {
    headers["retry-after"] = String(options.retryAfterSeconds);
  }
  if (options?.allow) {
    headers.allow = options.allow;
  }
  return Response.json(
    {
      ok: false,
      error: { code, message },
    },
    {
      status,
      headers,
    },
  );
}

export function logMcpEvent(event: {
  level: "info" | "warn" | "error";
  message: string;
  clientKey?: string;
  status?: number;
  tool?: string;
}): void {
  const payload = {
    service: "ans-food-business-fit-mcp",
    ts: new Date().toISOString(),
    ...event,
  };
  if (event.level === "error") {
    console.error(JSON.stringify(payload));
  } else if (event.level === "warn") {
    console.warn(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
}
