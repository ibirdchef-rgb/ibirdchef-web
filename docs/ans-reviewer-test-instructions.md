# ANS Food Business Fit — reviewer test instructions

## Website

1. Open `/business-fit`.
2. Confirm original ANS Food Service OS logo (transparent PNG).
3. Confirm trust chip reads **No contact information**.
4. Submit invalid ZIP → validation message.
5. Submit valid cafe concept → completed report.
6. Check desktop (1440), tablet (1024), mobile (390).
7. Print / Save PDF → hero photo removed; logo + report retained.
8. Visit `/privacy`, `/terms`, `/support`, `/data-request`, `/business-fit/disclaimer`.
9. On `/support`, confirm a clickable support link to `mailto:support@prosperityaxis.com`.
10. Confirm privacy / data-request pages still show a separate privacy-contact placeholder (do not assume support@prosperityaxis.com handles deletion requests).

## MCP

1. `GET /api/mcp/health` → ok.
2. Without bearer token in production → 401.
3. With token, call:
   - `analyze_business_fit`
   - `compare_food_service_concepts`
   - `build_startup_budget`
   - `generate_opening_checklist`
4. Invalid ZIP / missing fields → validation errors, no secrets.
5. Oversized body → 413.
6. Rapid repeated calls → 429.

## Suggested ChatGPT prompts

- “Can you evaluate whether my catering business idea is financially realistic?”
- “Compare a catering company, food truck, and café for my budget.”
- “Build a preliminary startup budget for a corporate catering business.”
- “Create an opening checklist for a personal-chef business.”

Confirm answers use planning language and do not claim live demand, ROI, or guaranteed opening outcomes.
