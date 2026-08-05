/**
 * Production MCP request guards: auth, size limits, rate limiting, safe errors.
 */

export const MCP_MAX_BODY_BYTES = 64 * 1024; // 64 KiB
export const MCP_RATE_LIMIT_WINDOW_MS = 60_000;

export function getRateLimitMax(): number {
  const parsed = Number(process.env.ANS_MCP_RATE_LIMIT_MAX ?? "60");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
}

type Bucket = { count: number; resetAt: number };

const rateBuckets = new Map<string, Bucket>();

export type SecurityFailure = {
  ok: false;
  status: number;
  error: {
    code: string;
    message: string;
  };
};

export type SecuritySuccess = {
  ok: true;
};

export function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(clientKey: string, now = Date.now()): SecuritySuccess | SecurityFailure {
  const existing = rateBuckets.get(clientKey);
  if (!existing || now >= existing.resetAt) {
    rateBuckets.set(clientKey, { count: 1, resetAt: now + MCP_RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (existing.count >= getRateLimitMax()) {
    return {
      ok: false,
      status: 429,
      error: {
        code: "rate_limited",
        message: "Too many requests. Please retry later.",
      },
    };
  }
  existing.count += 1;
  return { ok: true };
}

/** Test helper — clear in-memory buckets between tests. */
export function resetRateLimitBuckets(): void {
  rateBuckets.clear();
}

export function checkAuth(request: Request): SecuritySuccess | SecurityFailure {
  const required = process.env.ANS_MCP_AUTH_TOKEN?.trim();
  const enforce =
    process.env.ANS_MCP_REQUIRE_AUTH === "true" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

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
  if (!presented || presented !== required) {
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

export function safeErrorResponse(status: number, code: string, message: string): Response {
  return Response.json(
    {
      ok: false,
      error: { code, message },
    },
    {
      status,
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
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
  // Structured logs only — never log tokens, bodies, or PII fields.
  if (event.level === "error") {
    console.error(JSON.stringify(payload));
  } else if (event.level === "warn") {
    console.warn(JSON.stringify(payload));
  } else {
    console.info(JSON.stringify(payload));
  }
}
