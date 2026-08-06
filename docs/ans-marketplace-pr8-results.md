# Draft PR #8 — results and remaining blockers

**Branch:** `feature/ans-chatgpt-marketplace`  
**PR:** https://github.com/ibirdchef-rgb/ibirdchef-web/pull/8 (keep Draft; do not merge)  
**Pilot:** iBirdChef catering — Bay Area and Seattle  
**Out of scope:** Chef World, Revenue Bridge, OpenAI submission, production deploy

## Completed

1. Five read-only MCP tools including `simulate_event_profit`
2. Auth + separate pre-auth / post-auth rate limits; timing-safe bearer compare
3. Shared KV/Upstash rate-limit store required whenever MCP auth is enforced (`VERCEL_ENV=production` or `ANS_MCP_REQUIRE_AUTH=true`, including authenticated Preview); complete matching credential pairs only (never mixed); fail-closed 503 when unavailable
4. Proxy client-IP headers trusted on the Vercel boundary; outside Vercel only when `ANS_MCP_TRUST_PROXY=true` plus an allowlisted `ANS_MCP_TRUSTED_CLIENT_HEADER`
5. Strict closed-world schemas at the MCP transport boundary; domain-validation failures return MCP tool results with `isError: true`
6. JSON-RPC batch arrays rejected at `/api/mcp` before tool dispatch (`batch_not_supported`)
7. `GET /api/mcp` returns HTTP 405 with `Allow: POST, DELETE`
8. Oversized local MCP bodies return controlled HTTP 413 without socket destroy
9. Break-even / non-positive profit is never classified as profitable
10. Domain challenge at `/.well-known/openai-apps-challenge`
11. Exactly five positive and three negative Marketplace evaluation cases
12. Approved demo: cost $2,070, profit $2,055, margin 49.82%, decision **Budget mismatch**, human approval required
13. Owner-approved Business Fit privacy publication details on `/business-fit/privacy`:
    - Privacy contact: `order@ibirdchef.com`
    - Public mailing address: 3850 Klahanie Dr SE, Building 23, Apt 306, Sammamish, WA 98029, United States (**owner-approved for publication**)
    - `ANS_BUSINESS_ADDRESS` override honored on `/business-fit/privacy` and `/support`
    - Governing law: Washington State
    - Applicable California privacy rights honored where they apply (not a second governing jurisdiction)
    - Maximum standard retention: 90 days, with lawful/security exceptions
14. Terms page states Washington governing law and no longer claims placeholders remain

## Latest automated verification

| Check | Result |
|---|---|
| `pnpm test` | PASS (146/146) |
| Security + abuse tests | PASS |
| Shared rate-limit enforcement gate | PASS (production, `ANS_MCP_REQUIRE_AUTH`, authenticated Preview, local memory, fail-closed pairs) |
| Trusted non-Vercel client identity | PASS (configured proxy keys separate; unconfigured ignores spoofable headers) |
| Domain-validation MCP `isError` | PASS (invalid ZIP / commercial-action notes via `/api/mcp` transport) |
| JSON-RPC batch rejection | PASS (`batch_not_supported` before tool dispatch) |
| Marketplace evaluation cases | PASS (5+/3−) |
| Privacy / legal route tests | PASS |
| Business-address override tests | PASS |
| `pnpm lint` | PASS |
| `pnpm build` | PASS |
| Local MCP smoke (`mcp/smoke.mjs`) | PASS (`MCP_SMOKE_OK`, five tools) |
| `GET /api/mcp` / local GET `/mcp` | HTTP 405 + `Allow: POST, DELETE` |
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
- No custom in-repo MCP tool UI; live tool UX must be checked later in ChatGPT Developer Mode after stable HTTPS deploy.

## Explicit non-actions preserved

No quotes sent, payments accepted, events booked, capacity confirmed, menu prices imported, Revenue Bridge started, Chef World features, or production merge/deploy/submit from this work.
