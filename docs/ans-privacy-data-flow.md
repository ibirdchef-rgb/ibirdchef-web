# ANS Food Business Fit — privacy / data-flow summary

## Data in

| Input | Purpose | Contact info? |
|---|---|---|
| ZIP code | Planning context only | No |
| Business type / cuisine / service model | Model selection | No |
| Investment budget band | Budget alignment | No |
| Owner experience / facility size bands | Operational fit | No |
| Target opening date | Timeline readiness | No |
| Event-profit planning inputs (guests, budget, proposed price, costs, capacity-status flags, notes, pilot region) | Read-only simulation | No (unless operator voluntarily includes contact text in notes) |

## Data out

Deterministic planning JSON/report and read-only simulation outputs. Not quotes, payments, bookings, or capacity confirmations. Human approval is required before any commercial action.

## Systems touched

| System | Access |
|---|---|
| Next.js `/api/business-fit` | Read-only planning computation |
| Next.js `/api/mcp` | Read-only MCP tools |
| Hosting / runtime / CDN / logging | Technical metadata as needed to operate the service |
| Shared rate-limit store (if configured in production) | Rate-limit counters only |
| CLOW | Not connected |
| iBirdOS | Not connected |
| Vendor / payment systems | Not connected |
| Customer/tenant databases | Not connected |

## Retention / contact / law

- Privacy contact: `order@ibirdchef.com`
- Public mailing address (owner-approved for publication): 3850 Klahanie Dr SE, Building 23, Apt 306, Sammamish, WA 98029, United States
- Governing law: Washington State
- California: applicable California privacy rights and requirements are honored where they apply (not a second governing jurisdiction for every user)
- Retention: only as long as necessary for stated purposes, maximum standard period 90 days, unless longer retention is legally required or needed for security, fraud prevention, dispute handling, or enforcement

Policy page: `/business-fit/privacy`  
Separate iBirdChef catering privacy placeholder: `/privacy`
