# Draft PR #8 — results and remaining blockers

**Branch:** `feature/ans-chatgpt-marketplace`  
**PR:** https://github.com/ibirdchef-rgb/ibirdchef-web/pull/8 (keep Draft; do not merge)  
**Pilot:** iBirdChef catering — Bay Area and Seattle  
**Out of scope:** Chef World, Revenue Bridge, OpenAI submission, production deploy

## Completed in this iteration

1. **`simulate_event_profit`** read-only Marketplace tool (engine + MCP wiring + smoke).
2. Accepts guest count, budget, proposed price, target margin, food/labor/packaging/delivery/other costs, capacity status, pilot region.
3. Returns total known cost, recommended selling price, expected profit/margin, missing-cost warnings, budget variance, capacity status, decision state, and always `humanApprovalRequired` / `commercialActionsBlocked`.
4. Decision states: Profitable; Profitable with adjustments; Below target margin; Budget mismatch; Capacity risk; Missing cost information; Manual review required.
5. Blocks final profit conclusions when food or labor cost is missing.
6. Rejects negative/invalid/extreme/oversized/unknown inputs.
7. Rejects prompt-injection attempts to send quotes, accept payments, book events, confirm capacity, override costs, or bypass human approval.
8. Auth/rate-limit fix: authenticate first; pre-auth bucket only on failed auth; authenticated traffic uses post-auth limit; timing-safe bearer compare; enforce via `VERCEL_ENV=production` or `ANS_MCP_REQUIRE_AUTH` (not bare `NODE_ENV`).
9. Read-only / non-destructive / idempotent / closed-world annotations on all five MCP tools.
10. Domain-verification challenge at `/.well-known/openai-apps-challenge`.
11. Exactly five positive and three negative Marketplace evaluation cases.
12. Approved demonstration verified: 150 guests → cost $2,070, profit $2,055, margin 49.82%, decision **Budget mismatch**.

## Automated verification

| Check | Result |
|---|---|
| `pnpm test` | PASS (see latest commit report) |
| Security + abuse tests | PASS |
| Marketplace evaluation cases | PASS (5+/3−) |
| `pnpm lint` | PASS |
| `pnpm build` | PASS |
| Local MCP smoke (`mcp/smoke.mjs`) | PASS (`MCP_SMOKE_OK`, five tools including `simulate_event_profit`) |
| `GET /api/mcp` | HTTP 405 + `Allow: POST, DELETE` |
| Unknown MCP tool fields | Rejected at transport schema boundary |
| Oversized local MCP body | HTTP 413 without socket destroy |

## Remaining blockers (owner)

- Set `ANS_MCP_AUTH_TOKEN` in Vercel Production (never commit the value).
- Configure shared production rate-limit store env vars (`KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`). Production MCP fails closed with 503 until configured.
- Set `OPENAI_APPS_DOMAIN_CHALLENGE` (or `ANS_DOMAIN_VERIFICATION_CHALLENGE`) for domain verification.
- Approve remaining privacy/legal fields: `ANS_PRIVACY_CONTACT_EMAIL`, `ANS_BUSINESS_ADDRESS`, `ANS_GOVERNING_JURISDICTION`, `ANS_DATA_RETENTION_STATEMENT`.
- Owner approval required before: merge, production deploy, OpenAI App Directory submit.
- No custom in-repo MCP tool UI; live tool UX must be checked later in ChatGPT Developer Mode after stable HTTPS deploy.

## Explicit non-actions preserved

No quotes sent, payments accepted, events booked, capacity confirmed, menu prices imported, Revenue Bridge started, Chef World features, or production merge/deploy/submit from this work.
