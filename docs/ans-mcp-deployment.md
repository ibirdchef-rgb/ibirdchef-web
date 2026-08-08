# ANS Food Business Fit — MCP deployment guide

## Endpoints

| Environment | URL |
|---|---|
| Production (target) | `https://ibirdchef.com/api/mcp` |
| Health | `https://ibirdchef.com/api/mcp/health` |
| Domain challenge | `https://ibirdchef.com/.well-known/openai-apps-challenge` |
| Local development | `pnpm mcp:dev` → `http://127.0.0.1:8787/mcp` |

Transport: MCP Streamable HTTP (`WebStandardStreamableHTTPServerTransport` in Next.js).

## Required environment variables

See `.env.example`. Critical production values:

- `ANS_MCP_AUTH_TOKEN` — bearer token required when auth is enforced (never commit the value)
- `ANS_MCP_REQUIRE_AUTH=true` — force auth outside Vercel Production if needed
- Auth is enforced when `VERCEL_ENV=production` **or** `ANS_MCP_REQUIRE_AUTH=true` (not bare `NODE_ENV=production`)
- `ANS_MCP_RATE_LIMIT_MAX` — authenticated requests per client per minute (default 60)
- `ANS_MCP_PRE_AUTH_RATE_LIMIT_MAX` — failed-auth attempts per client per minute (default 30); does **not** cap authenticated traffic
- Shared rate-limit store is **mandatory whenever MCP auth is enforced**:
  - `VERCEL_ENV=production`, or
  - `ANS_MCP_REQUIRE_AUTH=true` (including authenticated non-Vercel hosts and authenticated Vercel Preview)
- Use a complete matching pair only — `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (never mix across pairs; if both complete pairs exist, KV is preferred)
- Authenticated deployments fail closed with HTTP 503 if no complete pair is configured or the store is unavailable
- Shared-store counters use an atomic Redis `EVAL` script (`INCR` + first-hit `EXPIRE`) so a successful increment cannot leave a key without TTL
- Every shared-store REST call is bounded by `SHARED_RATE_LIMIT_STORE_TIMEOUT_MS` (1.5s) via `AbortSignal.timeout`; stalls fail closed with HTTP 503
- Local unauthenticated development may use the in-memory limiter
- `OPENAI_APPS_DOMAIN_CHALLENGE` or `ANS_DOMAIN_VERIFICATION_CHALLENGE` — plain-text domain verification token
- `ANS_MCP_PRODUCTION_URL` — optional override reported in docs/metadata
- Approved support defaults: `support@prosperityaxis.com`, `https://ibirdchef.com/support`, countries `United States`
- Owner-approved privacy/legal defaults: privacy contact `order@ibirdchef.com`, published mailing address, Washington State governing law, 90-day standard retention (see `/business-fit/privacy`)

Never commit secrets.

### Client identity / rate-limit keys

- On Vercel (`VERCEL` set by the platform): client keys come from platform-provided forwarded headers (`x-vercel-forwarded-for`, then `x-real-ip`, then `x-forwarded-for`).
- Outside Vercel: spoofable forwarded headers are **ignored by default** (all clients share the safe `"unknown"` bucket).
- To enable per-client limits on a supported non-Vercel host behind your own reverse proxy, set **both**:
  - `ANS_MCP_TRUST_PROXY=true`
  - `ANS_MCP_TRUSTED_CLIENT_HEADER` to one allowlisted name: `x-forwarded-for`, `x-real-ip`, `cf-connecting-ip`, `true-client-ip`, or `x-ans-mcp-client-ip`
- Only that configured header is trusted. Partial/misconfigured settings fall back to `"unknown"`. Never trust arbitrary header names.
- JSON-RPC batch arrays are rejected at `/api/mcp` with HTTP 400 (`batch_not_supported`) so one HTTP request cannot execute many tool calls under a single rate-limit charge.

## Deploy notes

1. Merge Marketplace PR only after owner approval.
2. Configure env vars in Vercel (Production + Preview as appropriate).
3. Confirm `GET /api/mcp/health` returns `ok: true` and lists five tools including `simulate_event_profit`.
4. Confirm unauthorized `POST /api/mcp` returns 401 in production when token is set.
5. Confirm failed-auth floods return 429 with `Retry-After` without consuming authenticated budget.
6. Confirm `GET /.well-known/openai-apps-challenge` returns the configured challenge token.
7. Do not expose the local `127.0.0.1:8787` listener publicly.

## Security controls included

- Timing-safe bearer authentication when enforced
- Failed-auth and authenticated rate-limit buckets kept separate
- Request body size limit (64 KiB)
- Safe JSON errors (no stack traces / secrets) + `Retry-After` on 429
- Structured server logs without request bodies
- Five read-only, closed-world planning tools only (no quotes/payments/booking/capacity confirmation)
