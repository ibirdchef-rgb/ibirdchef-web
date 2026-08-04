# ChatGPT Marketplace Readiness — ANS Food Service OS

**Status:** Internal preparation only. This build is **not** approved or published in the ChatGPT app directory.  
**Do not** submit the app, expose the local MCP server publicly, or deploy marketplace infrastructure until Chef Simbu explicitly approves.

Related product docs: [`ans-food-service-mvp.md`](./ans-food-service-mvp.md)

---

## 1. Production remote MCP hosting

| Item | Current state | Before submission |
|---|---|---|
| Local MCP | `pnpm mcp:dev` → `http://127.0.0.1:8787/mcp` (private) | Keep local-only for development |
| Production host | Not deployed | Host MCP behind HTTPS on a managed platform (e.g. Vercel/Fly/Cloud Run) with a stable public URL |
| Transport | Streamable HTTP (dev) | Confirm OpenAI-required transport and health checks |
| Isolation | No CLOW / iBirdOS / DB connections | Preserve isolation; orchestrate only through ANS API when later phases allow |
| Rate limits / scaling | Dev-only | Add request limits, timeouts, and observability |

**Gate:** Do not publish an unauthenticated MCP endpoint.

---

## 2. MCP authentication and authorization

| Requirement | Notes |
|---|---|
| Authn | OAuth / API key / OpenAI connector auth as required by directory guidelines |
| Authz | Scope tools to planning-only; deny writes to CRM, payments, vendors |
| Secrets | Store in platform secrets; never commit keys |
| Audit | Log tool name, timestamp, non-PII request shape; no name/email/phone |
| Abuse | Per-IP / per-app rate limits; reject oversized payloads |

**Phase 1 tools (read-only planning):**

- `analyze_business_fit`
- `compare_food_service_concepts`
- `build_startup_budget`
- `generate_opening_checklist`

---

## 3. Tool descriptions and safety controls

Tool copy must state that outputs are **deterministic planning estimates**, not:

- Live financial feasibility
- Market demand or competition data
- Revenue potential or ROI
- Licensing guarantees or legal advice

Safety controls to keep:

- Zod validation on all inputs
- No PII fields in schemas
- Explicit disclaimers and data-source notes in every report
- No automatic vendor referral, lead creation, payment, lease, or purchase actions
- Language aligned to: Budget alignment · Timeline readiness · Operational fit · Planning risks

---

## 4. Privacy policy and support URL

| Asset | Status | Action before review |
|---|---|---|
| Privacy policy URL | Not published for ANS marketplace listing | Publish a dedicated page covering data collected (concept inputs only), retention, subprocessors, and contact |
| Support URL | Not published | Publish support / contact page (email or form) for marketplace users |
| Terms | Optional but recommended | Clarify planning-estimate limitations and no investment advice |

Phase 1 website prototype does **not** collect name, email, or phone.

---

## 5. App listing assets

| Asset | Prepared / planned | Location / notes |
|---|---|---|
| App name | ANS Food Service OS | Confirm exact directory display name |
| Short description | Preliminary food-business planning estimates (budget alignment, timeline readiness, operational fit, planning risks) | Avoid market-demand / ROI claims |
| Long description | Expand from MVP promise; list tools and disclaimers | Draft after hosting URL exists |
| Categories | Business / Productivity (confirm OpenAI taxonomy) | TBD at submission |
| Screenshots | Desktop + mobile `/business-fit` captures | `tmp/business-fit-screenshots/` (internal) |
| Logo / wordmark | Blue ANS Food Service OS (transparent) | `public/ans-food-service-os-logo.svg` |
| Square app icon | Matching ANS blue mark for directory | `public/ans-food-service-os-app-icon.svg`, `-512.png`, `-1024.png`, `-180.png` |
| Hero imagery | Custom-generated Seattle skyline (Space Needle) for web UI only | Not required for MCP listing; assets in `public/seattle-skyline-hero.*` (WebP/AVIF/JPG + source PNG). Not scraped from an unlicensed stock site. |

**Alt text for logo:** `ANS Food Service OS`

---

## 6. Testing instructions (pre-submission)

1. Run `pnpm test`, `pnpm lint`, `pnpm build` on the feature branch.
2. Manually verify `/business-fit` at 1440px, 1024px, and 390px.
3. Generate a fit report; confirm print layout removes Seattle hero and keeps logo + full report.
4. Exercise MCP tools locally via `pnpm mcp:dev` (private only).
5. Confirm tool responses include disclaimers and do not claim live market feeds.
6. Confirm no Concierge / homepage / global nav regressions.
7. After production MCP exists: end-to-end connector test in a private ChatGPT workspace (not public listing).

---

## 7. Country availability

| Decision | Recommendation until approved |
|---|---|
| Initial availability | United States only (ZIP-based planning inputs) |
| Expansion | Defer until jurisdiction-aware licensing guidance exists |
| Language | English (US) for Phase 1 |

---

## 8. OpenAI submission and review checklist

- [ ] Production MCP URL live over HTTPS
- [ ] Authentication configured per OpenAI requirements
- [ ] Tool schemas and descriptions reviewed for accuracy and safety
- [ ] Privacy policy URL live
- [ ] Support URL live
- [ ] App name, description, categories finalized
- [ ] Screenshots and square icon uploaded
- [ ] Country availability set (recommend US-only initially)
- [ ] Internal legal / brand review of listing copy
- [ ] Private ChatGPT workspace E2E pass
- [ ] Chef Simbu explicit approval to submit
- [ ] Submit via OpenAI developer / app directory flow
- [ ] Monitor review feedback; do not advertise as published until approved

---

## Explicit non-goals for this preparation pass

- No ChatGPT directory submission
- No public exposure of `127.0.0.1:8787/mcp`
- No marketplace infrastructure deploy
- No merge or production deploy of PR #7 without approval
