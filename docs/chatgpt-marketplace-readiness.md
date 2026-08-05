# ChatGPT Marketplace readiness checklist — ANS Food Business Fit

**Status:** Foundation prepared on `feature/ans-chatgpt-marketplace`.  
**Do not submit** to the ChatGPT App Directory until owner approval and missing configuration are complete.

## Checklist

- [x] Production-capable remote MCP path: `/api/mcp` (target `https://ibirdchef.com/api/mcp`)
- [x] Streamable HTTP transport (Web Standard)
- [x] Health endpoint: `/api/mcp/health`
- [x] Four read-only tools registered
- [x] Request size limits + rate limiting + safe errors
- [x] Auth hook via `ANS_MCP_AUTH_TOKEN` (enforced in production)
- [x] Privacy / terms / support / data-request / disclaimer pages
- [x] Marketplace metadata draft
- [x] Deployment guide + env template placeholders
- [x] Security/abuse tests
- [ ] Owner fills support/privacy/legal env values
- [ ] Owner sets production MCP bearer token
- [ ] Owner confirms country availability
- [ ] Authenticated reviewer walkthrough in ChatGPT
- [ ] Owner approval to submit

## Related docs

- `docs/ans-mcp-deployment.md`
- `docs/ans-marketplace-metadata.md`
- `docs/ans-privacy-data-flow.md`
- `docs/ans-security-abuse-checklist.md`
- `docs/ans-reviewer-test-instructions.md`

## Explicit non-goals in this phase

- No Revenue Bridge
- No menu import
- No ChatGPT directory submission
- No unauthenticated public local MCP exposure
