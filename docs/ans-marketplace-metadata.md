# ANS Food Business Fit — Marketplace metadata (draft)

**Status:** Internal preparation only. Do not submit to the ChatGPT App Directory until owner approval.

| Field | Value |
|---|---|
| App name | ANS Food Business Fit |
| Publisher | ANS Corporation |
| Short description | Preliminary food-business planning estimates for budget alignment, timeline readiness, operational fit, and planning risks. |
| Full description | ANS Food Business Fit helps food-business operators evaluate whether a concept is ready to plan further. It provides deterministic preliminary estimates for startup budget ranges, opening timeline readiness, operational complexity signals, major planning risks, missing information, and next steps. It is a planning and qualification app—not a live feasibility study, market-demand product, quoting engine, or the full CLOW/iBirdOS Lead-to-Profit platform. Results require local professional verification. |
| MCP production URL | https://ibirdchef.com/api/mcp |
| Privacy URL | https://ibirdchef.com/business-fit/privacy |
| Terms URL | https://ibirdchef.com/terms |
| Support URL | https://ibirdchef.com/support |
| Support email | support@prosperityaxis.com (`mailto:support@prosperityaxis.com`) — general Marketplace support only |
| Privacy contact | order@ibirdchef.com — Business Fit privacy / data requests |
| Public mailing address | 3850 Klahanie Dr SE, Building 23, Apt 306, Sammamish, WA 98029, United States (owner-approved for publication) |
| Governing law | Washington State (California privacy rights honored where applicable; not a second governing jurisdiction) |
| Disclaimer URL | https://ibirdchef.com/business-fit/disclaimer |
| Data request URL | https://ibirdchef.com/data-request |
| Authentication | Bearer token via `ANS_MCP_AUTH_TOKEN` (required in production). Exact ChatGPT connector auth mechanism to be confirmed against current OpenAI Apps SDK requirements before submission. |
| Supported countries | United States (approved) |
| Rectangular logo | `public/ans-food-service-os-logo.png` (source: `public/brand/ans-food-service-os-logo-source.png`) |
| Square Marketplace icon | `public/ans-food-service-os-app-icon.svg` (+ 512/1024 PNG) |
| Domain verification | `/.well-known/openai-apps-challenge` (token from env; never commit) |

## Tool descriptions

All tools advertise MCP annotations: `readOnlyHint`, `destructiveHint: false`, `idempotentHint`, `openWorldHint: false`.

1. **analyze_business_fit** — Preliminary Business Fit report (budget alignment, timeline readiness, operational fit, planning risks).
2. **compare_food_service_concepts** — Compare 2–3 concepts with the same planning model.
3. **build_startup_budget** — Preliminary startup budget planning range and categories.
4. **generate_opening_checklist** — Generic opening checklist categories requiring local review.
5. **simulate_event_profit** — Read-only event-profit simulation for iBirdChef catering pilots (Seattle / Bay Area). Always requires human approval; never sends quotes, accepts payments, books events, or confirms capacity.

## Suggested prompts

- “Can you evaluate whether my catering business idea is financially realistic?”
- “Compare a catering company, food truck, and café for my budget.”
- “Build a preliminary startup budget for a corporate catering business.”
- “Create an opening checklist for a personal-chef business.”
- “Simulate profit for a 150-guest Seattle catering event with these costs and a $3,500 budget.”

## Intended users

Food-business founders and operators evaluating restaurants, cafés, food trucks, ghost kitchens, catering, bakeries, or hybrid concepts before major lease or build-out commitments.

## Data-handling summary

No contact information collected in Phase 1 planning inputs. ZIP and concept bands used for deterministic planning estimates only. No automatic quotes, payments, bookings, or outreach.

## Known limitations

No live market/competition/rent feeds; no revenue/ROI guarantees; licensing checklists are generic; MCP auth/token distribution and owner legal contacts must be finalized before submission.
