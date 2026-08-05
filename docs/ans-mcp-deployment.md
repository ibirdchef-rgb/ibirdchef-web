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
- `OPENAI_APPS_DOMAIN_CHALLENGE` or `ANS_DOMAIN_VERIFICATION_CHALLENGE` — plain-text domain verification token
- `ANS_MCP_PRODUCTION_URL` — optional override reported in docs/metadata
- Approved support defaults: `support@prosperityaxis.com`, `https://ibirdchef.com/support`, countries `United States`
- Remaining owner/legal placeholders: `ANS_PRIVACY_CONTACT_EMAIL`, `ANS_BUSINESS_ADDRESS`, `ANS_GOVERNING_JURISDICTION`, `ANS_DATA_RETENTION_STATEMENT`

Never commit secrets.

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
