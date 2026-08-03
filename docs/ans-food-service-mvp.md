# ANS Food Service OS — MVP (Phase 1)

## Product promise

Before a customer invests in a food business, ANS helps clarify the concept, preliminary startup range, likely opening timeline, major risks, and the validation work still required.

## Phase 1 vertical slice

| Surface | Path / command |
|---|---|
| Website prototype | `/business-fit` |
| JSON API | `POST /api/business-fit` |
| MCP development server | `pnpm mcp:dev` → `http://127.0.0.1:8787/mcp` |
| Tools | `analyze_business_fit`, `compare_food_service_concepts`, `build_startup_budget`, `generate_opening_checklist` |

All outputs are **deterministic planning estimates** with explicit confidence, assumptions, disclaimers, and data-source notes.

## System ownership (future)

- **ChatGPT app:** discovery and customer-facing planning
- **ANS API:** permissions, consent, audit, orchestration, idempotency
- **CLOW:** lead relationship, reminders, follow-up, human handoff
- **iBirdOS:** recipes, costs, labor, inventory, forecasts, actual profit
- **ANS advisor:** final review of feasibility, vendors, commissions, commitments

Phase 1 does **not** connect ChatGPT, CLOW, iBirdOS, vendors, or databases.

## Guardrails

- No claim of live demographic, rent, competition, permit, or vendor data
- No automatic vendor referral, quote request, lead creation, payment, lease, or purchase
- No PII collection in Phase 1 inputs (no name/email/phone)
- Licensing, legal, financing, insurance, investment, and real-estate decisions require qualified local review
- MCP development endpoint is local/private only; do not publish unauthenticated

## Inputs

ZIP code, business type, cuisine, investment budget band, owner experience, facility size, service model, target opening date.

## Outputs

Preliminary concept-fit score, assumptions, confidence, startup-budget range, opening timeline, licensing/checklist categories, equipment categories, major risks, missing information, suggested next steps.

## Local verification

```bash
pnpm test
pnpm lint
pnpm build
pnpm mcp:dev
```

## Isolation from iBirdChef production UX

- No ANS link in production site navigation
- Catering Concierge, curated menu, and inquiry API are unchanged by this feature
- Feature branch work must not be merged or deployed without Chef Simbu approval
