# ChatGPT Marketplace readiness checklist — ANS Food Business Fit

**Status:** Foundation prepared on `feature/ans-chatgpt-marketplace`.  
**Do not submit** to the ChatGPT App Directory until owner approval and missing configuration are complete.

## Checklist

- [x] Production-capable remote MCP path: `/api/mcp` (target `https://ibirdchef.com/api/mcp`)
- [x] Streamable HTTP transport (Web Standard)
- [x] Health endpoint: `/api/mcp/health`
- [x] Five read-only tools registered (includes `simulate_event_profit`)
- [x] Tool annotations: read-only, non-destructive, idempotent, closed-world
- [x] Request size limits + rate limiting + safe errors
- [x] Auth via `ANS_MCP_AUTH_TOKEN` (enforced on `VERCEL_ENV=production` or `ANS_MCP_REQUIRE_AUTH=true`; not bare `NODE_ENV`)
- [x] Pre-auth rate limit applies only to failed-auth traffic; authenticated traffic uses post-auth limit
- [x] Domain-verification challenge endpoint: `/.well-known/openai-apps-challenge`
- [x] Privacy / terms / support / data-request / disclaimer pages
- [x] Marketplace metadata draft
- [x] Deployment guide + env template placeholders
- [x] Security/abuse tests + Marketplace evaluation cases (5 positive / 3 negative)
- [x] Owner approved Marketplace support email: `support@prosperityaxis.com`
- [x] Owner approved support URL: `https://ibirdchef.com/support`
- [x] Owner approved supported countries: United States
- [x] Owner-approved privacy/legal publication values wired (privacy contact, address, Washington governing law, 90-day retention, California rights where applicable)
- [ ] Owner sets production MCP bearer token (`ANS_MCP_AUTH_TOKEN`)
- [ ] Owner sets domain challenge token (`OPENAI_APPS_DOMAIN_CHALLENGE`)
- [ ] Authenticated reviewer walkthrough in ChatGPT
- [ ] Owner approval to submit

## Related docs

- `docs/ans-mcp-deployment.md`
- `docs/ans-marketplace-metadata.md`
- `docs/ans-marketplace-evaluation-cases.md`
- `docs/ans-mcp-developer-mode-runbook.md`
- `docs/ans-privacy-data-flow.md`
- `docs/ans-security-abuse-checklist.md`
- `docs/ans-reviewer-test-instructions.md`

## Explicit non-goals in this phase

- No Revenue Bridge
- No menu import
- No ChatGPT directory submission
- No Chef World marketplace features
- No unauthenticated public local MCP exposure
