# ANS Food Business Fit — security & abuse checklist

- [x] Read-only planning tools only
- [x] Strict Zod schemas (unknown fields rejected)
- [x] Input length limits
- [x] Request body size limit (64 KiB)
- [x] Rate limiting per client key
- [x] Bearer auth when production/enforced
- [x] Safe errors (no stack traces / secrets)
- [x] Structured logs without bodies/tokens
- [x] No arbitrary URL fetch / filesystem / code execution in tools
- [x] No customer/tenant data access
- [x] No quote / payment / booking / outreach actions
- [x] Prompt-injection style labels rejected or bounded
- [x] HTML/script date strings rejected by schema
- [ ] Owner configures production `ANS_MCP_AUTH_TOKEN`
- [ ] Owner confirms connector auth with OpenAI Apps SDK requirements
- [ ] Owner completes privacy/support legal contacts
