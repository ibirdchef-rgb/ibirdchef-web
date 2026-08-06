# ANS Food Business Fit — production / Developer Mode runbook

## Endpoints

- MCP: `https://ibirdchef.com/api/mcp` (after merge/deploy)
- Health: `https://ibirdchef.com/api/mcp/health`
- Domain challenge: `https://ibirdchef.com/.well-known/openai-apps-challenge`
- Local: `pnpm mcp:dev` → `http://127.0.0.1:8787/mcp`

## Auth

1. Store `ANS_MCP_AUTH_TOKEN` only in Vercel Production env (never commit).
2. Production enforcement uses `VERCEL_ENV=production` or `ANS_MCP_REQUIRE_AUTH=true`.
3. Call MCP with `Authorization: Bearer <token>`.
4. Failed-auth traffic is rate-limited separately from authenticated traffic.
5. Authenticated traffic uses `ANS_MCP_RATE_LIMIT_MAX` (default 60/min).

## Domain verification

1. Set `OPENAI_APPS_DOMAIN_CHALLENGE` (or `ANS_DOMAIN_VERIFICATION_CHALLENGE`) in Vercel.
2. `GET /.well-known/openai-apps-challenge` returns the token as `text/plain`.
3. Do not document the token value in git.

## Reviewer checks

1. Run evaluation cases in `docs/ans-marketplace-evaluation-cases.md`.
2. Confirm P5 demonstration numbers and **Budget mismatch**.
3. Confirm tools advertise read-only / non-destructive / closed-world annotations.
4. Confirm support email/URL and United States availability are approved values.
5. Confirm `/business-fit/privacy` shows owner-approved privacy contact, published mailing address, Washington governing law, California rights where applicable, and 90-day retention.

## Explicit non-goals

No OpenAI submission from this runbook. No production merge without owner approval. No Revenue Bridge. No Chef World.
