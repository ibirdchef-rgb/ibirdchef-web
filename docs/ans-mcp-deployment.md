# ANS Food Business Fit — MCP deployment guide

## Endpoints

| Environment | URL |
|---|---|
| Production (target) | `https://ibirdchef.com/api/mcp` |
| Health | `https://ibirdchef.com/api/mcp/health` |
| Local development | `pnpm mcp:dev` → `http://127.0.0.1:8787/mcp` |

Transport: MCP Streamable HTTP (`WebStandardStreamableHTTPServerTransport` in Next.js).

## Required environment variables

See `.env.example`. Critical production values:

- `ANS_MCP_AUTH_TOKEN` — bearer token required when auth is enforced
- `ANS_MCP_REQUIRE_AUTH=true` — force auth outside production detection if needed
- `ANS_MCP_RATE_LIMIT_MAX` — requests per client per minute (default 60)
- `ANS_MCP_PRODUCTION_URL` — optional override reported in docs/metadata
- Owner/legal placeholders: `ANS_SUPPORT_EMAIL`, `ANS_SUPPORT_URL`, `ANS_PRIVACY_CONTACT_EMAIL`, `ANS_BUSINESS_ADDRESS`, `ANS_GOVERNING_JURISDICTION`, `ANS_DATA_RETENTION_STATEMENT`, `ANS_SUPPORTED_COUNTRIES`

Never commit secrets.

## Deploy notes

1. Merge Marketplace PR only after owner approval.
2. Configure env vars in Vercel (Production + Preview as appropriate).
3. Confirm `GET /api/mcp/health` returns `ok: true`.
4. Confirm unauthorized `POST /api/mcp` returns 401 in production when token is set.
5. Do not expose the local `127.0.0.1:8787` listener publicly.

## Security controls included

- Bearer authentication when enforced
- Request body size limit (64 KiB)
- In-memory rate limiting per client key
- Safe JSON errors (no stack traces / secrets)
- Structured server logs without request bodies
- Read-only planning tools only
