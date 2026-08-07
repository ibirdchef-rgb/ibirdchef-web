# Draft PR #8 — results and remaining blockers

**Branch:** `feature/ans-chatgpt-marketplace`  
**PR:** https://github.com/ibirdchef-rgb/ibirdchef-web/pull/8 (keep Draft; do not merge)  
**Pilot:** iBirdChef catering — Bay Area and Seattle  
**Out of scope:** Chef World, Revenue Bridge, OpenAI submission, production deploy

## Completed

1. Five read-only MCP tools including `simulate_event_profit`
2. Auth + separate pre-auth / post-auth rate limits; timing-safe bearer compare
3. Shared KV/Upstash rate-limit store required whenever MCP auth is enforced (`VERCEL_ENV=production` or `ANS_MCP_REQUIRE_AUTH=true`, including authenticated Preview); complete matching credential pairs only (never mixed); fail-closed 503 when unavailable
4. Shared-store counters use an atomic Redis `EVAL` script (`INCR` + first-hit `EXPIRE`) so a successful increment cannot leave a key without TTL
5. Proxy client-IP headers trusted on the Vercel boundary; outside Vercel only when `ANS_MCP_TRUST_PROXY=true` plus an allowlisted `ANS_MCP_TRUSTED_CLIENT_HEADER`
6. Strict closed-world schemas at the MCP transport boundary; domain-validation failures return MCP tool results with `isError: true`
7. JSON-RPC batch arrays rejected at `/api/mcp` before tool dispatch (`batch_not_supported`)
8. `GET /api/mcp` returns HTTP 405 with `Allow: POST, DELETE`
9. Oversized local MCP bodies return controlled HTTP 413 without socket destroy
10. Break-even / non-positive profit is never classified as profitable
11. Domain challenge at `/.well-known/openai-apps-challenge`
12. Exactly five positive and three negative Marketplace evaluation cases
13. Approved demo: cost $2,070, profit $2,055, margin 49.82%, decision **Budget mismatch**, human approval required
14. Owner-approved Business Fit privacy publication details on `/business-fit/privacy`
15. `/data-request`, `/support`, `/terms`, and `/business-fit/privacy` all render `ansOwnerConfig.supportEmail` (honors `ANS_SUPPORT_EMAIL`)
16. Terms page states Washington governing law and no longer claims placeholders remain

## Latest automated verification

| Check | Result |
|---|---|
| `pnpm test` | PASS (156/156) |
| Security + abuse tests | PASS |
| Atomic rate-limit INCR+EXPIRE | PASS (mocked REST EVAL; no live KV/Redis) |
| Shared rate-limit enforcement gate | PASS |
| Trusted non-Vercel client identity | PASS |
| Domain-validation MCP `isError` | PASS |
| JSON-RPC batch rejection | PASS |
| Marketplace evaluation cases | PASS (5+/3−) |
| Privacy / legal / data-request route tests | PASS |
| Support-email override consistency | PASS |
| `pnpm lint` | PASS |
| `pnpm build` | PASS |
| Local MCP smoke (`mcp/smoke.mjs`) | PASS (`MCP_SMOKE_OK`, five tools) |
| `GET /api/mcp` | HTTP 405 + `Allow: POST, DELETE` |
| Unknown MCP tool fields | Rejected at transport schema boundary |
| Oversized local MCP body | HTTP 413 `payload_too_large` |
| Global `/privacy` | Remains separate iBirdChef catering placeholder |
| Approved demo | $2,070 cost / $2,055 profit / 49.82% margin / Budget mismatch / human approval required |

## Remaining blockers (owner)

- Set `ANS_MCP_AUTH_TOKEN` in Vercel Production (never commit the value).
- Configure one complete shared rate-limit pair whenever auth is enforced: `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
- For authenticated non-Vercel hosts behind a reverse proxy: set `ANS_MCP_TRUST_PROXY=true` and an allowlisted `ANS_MCP_TRUSTED_CLIENT_HEADER`.
- Set `OPENAI_APPS_DOMAIN_CHALLENGE` (or `ANS_DOMAIN_VERIFICATION_CHALLENGE`).
- Owner approval required before: merge, production deploy, OpenAI App Directory submit.

## Explicit non-actions preserved

No quotes sent, payments accepted, events booked, capacity confirmed, menu prices imported, Revenue Bridge started, Chef World features, or production merge/deploy/submit from this work.
