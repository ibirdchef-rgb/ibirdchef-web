# iBirdChef catering platform architecture

## Components

1. **iBirdChef website and AI chat** — customer-facing site and inquiry assistant for corporate catering, personal/family events, and private-chef services. Answers only from approved menus, services, service areas, policies, and published pricing. Collects structured event details and sends qualified leads into Clow.
2. **Clow — Marketing and Lead Follow-Up Engine** — attracts/captures leads, tracks source and campaign, qualifies customers, sends approved follow-ups, reminds the team about inactive leads, and moves qualified opportunities toward quotation and booking.
3. **iBirdOS Engine — Event Profitability and Operations** — receives complete event requirements; calculates ingredient, labor, packaging, delivery, equipment, rental, service, tax, and overhead costs; recommends a selling price that protects margin; flags under-margin events; supports quotation approval, production planning, purchasing, staffing, invoicing, and post-event profit review.

## Required workflow

```text
Marketing source
  → Website / AI chat
  → Clow lead record and follow-up
  → iBirdOS costing and margin check
  → Manager approval
  → Customer quotation
  → Booking and event operations
  → Final profit review
```

This workflow applies to:

- Corporate catering and recurring workplace meals
- Personal and family events (birthdays, anniversaries, baby showers, graduations, housewarmings, religious/cultural celebrations, private dinners, live cooking)

The AI chat must **not** independently decide profitability. It gathers accurate information; iBirdOS performs cost/margin calculation; an authorized manager approves the final quote.

## Shared schema

Canonical TypeScript type: `EventInquiry` in `src/lib/event-inquiry.ts`.

Website forms and future AI chat Task A should produce the same shape, including:

- Event category (corporate / personal_family / private_chef / other)
- Event type, date, time, location, guest count
- Cuisine preference, service style, service type
- Dietary/allergy needs, estimated budget
- Lead source, page source
- Contact consent and SMS consent
- Free-form message

## Proposed Clow payload

Built by `buildClowInquiryPayload()` in `src/lib/clow-intake.ts`.

```json
{
  "submissionId": "web_…",
  "name": "string",
  "email": "string",
  "phone": "string",
  "eventCategory": "corporate | personal_family | private_chef | other",
  "eventType": "string",
  "eventDate": "YYYY-MM-DD",
  "eventTime": "string",
  "eventLocation": "string",
  "guestCount": "string",
  "cuisinePreference": "string",
  "serviceStyle": "string",
  "serviceType": "string",
  "estimatedBudget": "string",
  "dietaryNeeds": "string",
  "leadSource": "string",
  "pageSource": "homepage | private-events | menu-chat | other",
  "contactConsent": true,
  "smsConsent": false,
  "message": "string"
}
```

Transport today: signed HTTPS POST using env vars `CLOW_IBIRDCHEF_INTAKE_URL` and `IBIRDCHEF_INQUIRY_WEBHOOK_SECRET`. Email via Resend remains the customer-success path if Clow is unavailable.

## Proposed iBirdOS payload

Built by `buildIBirdOsCostingRequest()` in `src/lib/ibirdos-intake.ts`.

```json
{
  "submissionId": "web_…",
  "source": "ibirdchef-web",
  "workflowStage": "pending_costing",
  "event": {
    "category": "personal_family",
    "type": "Anniversary",
    "date": "YYYY-MM-DD",
    "time": "string",
    "location": "string",
    "guestCount": "string",
    "cuisinePreference": "string",
    "serviceStyle": "string",
    "serviceType": "string",
    "dietaryNeeds": "string",
    "estimatedBudget": "string",
    "notes": "string"
  },
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string"
  },
  "marketing": {
    "leadSource": "string",
    "pageSource": "private-events",
    "contactConsent": true,
    "smsConsent": false
  },
  "costingChecklist": [
    "ingredients",
    "labor",
    "packaging",
    "delivery",
    "equipment",
    "rental",
    "service",
    "tax",
    "overhead"
  ]
}
```

Transport: **not configured in this pass**. `forwardInquiryToIBirdOs()` returns `not_configured` until an approved intake URL and auth model exist. Do not invent endpoints or credentials.

## AI chat Task A (approved) vs Task B (held)

Approved now: qualify leads, answer approved menu/service questions, collect structured details, provide published $18 seasonal box pricing when applicable, prepare Clow lead, explain custom quotes for personal/family events, escalate complex requests.

Held: deposits/payments, fake urgency / limited-slot claims without real availability data, unapproved final quotations, revealing internal margins.

Policy helpers live in `src/lib/ai-chat-policy.ts`. Live model wiring is out of scope for this pass.

## Quote draft and Chef Simbu approval (internal)

Public curated-menu V1 pricing labels are **not** financial approval. Implementation lives in:

- `src/lib/quote-draft.ts` — intake, cost inputs, calculation, chef breakdown, audit types
- `src/lib/quote-approval-workflow.ts` — draft creation, calculate/flag, approve/edit/reject, send blocked

Rules in this pass:

1. AI may collect contact, event, guest count, menu selections, service style, dietary needs, and delivery/setup/staffing/equipment needs.
2. Costing uses only current internal costs. Missing/outdated costs are flagged. Historical menu prices are forbidden as costs. Values are never invented.
3. Required math: direct cost → cost before profit → selling price before tax → final quote with tax.
4. Every AI-generated quote is saved as **Draft — Pending Chef Approval** with an internal Chef Simbu cost breakdown.
5. Chef Simbu may approve, edit, or reject. Audit events record calculation, edits, approval/rejection, and blocked send attempts.
6. Automatic customer quoting/sending is **not activated**. Even approved drafts cannot be sent yet.
7. Seafood, lamb, goat, rentals, staffed events, and market-priced ingredients require manual approval. Public `$18` seasonal pricing must not change until reviewed.

## Privacy

`/privacy` remains a `noindex` placeholder until approved policy text is provided. Do not invent policy language.
