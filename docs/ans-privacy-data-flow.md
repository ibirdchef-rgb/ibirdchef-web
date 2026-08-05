# ANS Food Business Fit — privacy / data-flow summary

## Data in

| Input | Purpose | Contact info? |
|---|---|---|
| ZIP code | Planning context only | No |
| Business type / cuisine / service model | Model selection | No |
| Investment budget band | Budget alignment | No |
| Owner experience / facility size bands | Operational fit | No |
| Target opening date | Timeline readiness | No |

## Data out

Deterministic planning JSON/report: fit score breakdown, budget ranges, timeline phases, risks, missing information, next steps, disclaimers.

## Systems touched

| System | Access |
|---|---|
| Next.js `/api/business-fit` | Read-only planning computation |
| Next.js `/api/mcp` | Read-only MCP tools |
| CLOW | Not connected |
| iBirdOS | Not connected |
| Vendor / payment systems | Not connected |
| Customer/tenant databases | Not connected |

## Retention / sharing

Owner must set `ANS_DATA_RETENTION_STATEMENT` and privacy contact fields. No sale of planning inputs intended. Hosting providers may process technical metadata.
