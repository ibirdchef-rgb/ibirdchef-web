# ANS Food Business Fit — reviewer test instructions

## Website

1. Open `/business-fit`.
2. Confirm original ANS Food Service OS logo (transparent PNG).
3. Confirm trust chip reads **No contact information**.
4. Submit invalid ZIP → validation message.
5. Submit valid cafe concept → completed report.
6. Check desktop (1440), tablet (1024), mobile (390).
7. Print / Save PDF → hero photo removed; logo + report retained.
8. Visit `/business-fit/privacy`, `/terms`, `/support`, `/data-request`, `/business-fit/disclaimer`.
9. Visit `/privacy` separately and confirm it remains the iBirdChef catering privacy placeholder.
10. On `/support`, confirm a clickable support link to `mailto:support@prosperityaxis.com`.
11. Confirm `/business-fit/privacy` and `/data-request` show privacy contact `order@ibirdchef.com` (not the general support inbox).

## MCP

1. `GET /api/mcp/health` → ok; lists five tools including `simulate_event_profit`.
2. Without bearer token in production → 401 (failed-auth floods → 429 with `Retry-After`).
3. With token, call:
   - `analyze_business_fit`
   - `compare_food_service_concepts`
   - `build_startup_budget`
   - `generate_opening_checklist`
   - `simulate_event_profit` (approved demo below)
4. Confirm tool annotations are read-only / non-destructive / closed-world.
5. Invalid ZIP / missing fields / injection notes → validation errors, no secrets.
6. Oversized body → 413.
7. Rapid authenticated calls → 429 on post-auth limit only.
8. `GET /.well-known/openai-apps-challenge` → configured plain-text token (404 if unset).
9. Run evaluation cases in `docs/ans-marketplace-evaluation-cases.md` (5 positive / 3 negative).

### Approved `simulate_event_profit` demonstration

- 150 guests; budget $3,500; proposed price $4,125
- Food $1,120; labor $620; packaging $185; delivery $145
- Expect total cost $2,070; profit $2,055; margin ~49.82%; decision **Budget mismatch**
- `humanApprovalRequired: true`; no quote/payment/booking/capacity confirmation

## Suggested ChatGPT prompts

- “Can you evaluate whether my catering business idea is financially realistic?”
- “Compare a catering company, food truck, and café for my budget.”
- “Build a preliminary startup budget for a corporate catering business.”
- “Create an opening checklist for a personal-chef business.”
- “Simulate profit for a 150-guest Seattle catering event with these costs and a $3,500 budget.”

Confirm answers use planning language and do not claim live demand, ROI, guaranteed opening outcomes, or commercial execution.
