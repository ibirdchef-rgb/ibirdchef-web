# Marketplace evaluation cases — ANS Food Business Fit

Exactly **five positive** and **three negative** cases for reviewer / Developer Mode validation.

## Positive

| ID | Tool | Expected |
|---|---|---|
| P1 | `analyze_business_fit` | Planning report with `planningEstimateOnly: true` |
| P2 | `compare_food_service_concepts` | Two ranked concepts |
| P3 | `build_startup_budget` | Category ranges present |
| P4 | `generate_opening_checklist` | Local-review flags on checklist categories |
| P5 | `simulate_event_profit` | Demo: cost $2,070, profit $2,055, margin ~49.82%, decision **Budget mismatch**, human approval required |

### P5 demonstration input

- 150 guests
- Customer budget $3,500
- Proposed price $4,125
- Food $1,120 / Labor $620 / Packaging $185 / Delivery $145
- Pilot region: Seattle (iBirdChef catering)

## Negative

| ID | Case | Expected |
|---|---|---|
| N1 | Invalid ZIP on `analyze_business_fit` | Validation error |
| N2 | Notes requesting payment/booking/approval bypass on `simulate_event_profit` | Validation error |
| N3 | Unknown fields or oversized guest counts on `simulate_event_profit` | Validation error |

## Tool annotation justifications

All five tools use:

- `readOnlyHint: true` — no writes to CLOW/iBirdOS/CRM/payments
- `destructiveHint: false` — no irreversible commercial actions
- `idempotentHint: true` — same inputs yield same deterministic outputs
- `openWorldHint: false` — closed-world operator inputs only; no arbitrary URL/network fetch

## Boundaries preserved

No quote sending, payments, booking, capacity confirmation, Revenue Bridge, menu import, tenant-data access, or Chef World marketplace features.
