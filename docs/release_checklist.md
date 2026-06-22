# Unified Release Readiness Checklist

This checklist verifies that all engineering requirements for the final release have been met, specifically addressing the areas of contract governance, traceability, reliability, performance, telemetry, accessibility, invoicing, payment gateways, and reporting.

## 1. Core Finance Dashboard & Invoicing (P6-A4)
- [ ] Dashboard loads KPI cards without errors for all roles
- [ ] MRR and AR aging charts render for roles with report access
- [ ] Recent invoices list displays correctly
- [ ] Overdue alert banner appears when overdue invoices exist
- [ ] Role switcher updates permissions without page crash

## 2. Invoices & Payments Lifecycle
- [ ] Client checkout loads invoice by number lookup
- [ ] Stripe Elements card form renders with env key (`NEXT_PUBLIC_STRIPE_KEY`)
- [ ] Payment uses `stripe.confirmPayment()` lifecycle (not simulated timeout)
- [ ] Successful payment records ledger entry and marks invoice PAID
- [ ] Manual wire reconciler records payment on payments page
- [ ] Payment intent API route responds with client secret
- [ ] Invoice list loads with search, filter, and sort
- [ ] Invoice builder creates draft invoices
- [ ] Invoice detail panel updates status correctly
- [ ] Pay link routes to client checkout for eligible invoices

## 3. Reporting, Analytics & QA (P6-A5)
- [x] Mock data removed from external dependencies. All data sources securely isolated.
- [x] ArAgeing buckets calculate effectively.
- [x] Analytics aggregates map precisely to expected visual charts (MRR, Trends, Distributions).
- [x] Fallback logic removed; exact schemas enforced.

## 4. API Contract Verification & Telemetry
- [x] API client strictly throws `ContractValidationError` on bad payloads.
- [x] Responses contain pagination metadata (`page`, `page_size`, `total`, `has_next`).
- [x] Error payloads contain traceability parameters (`trace_id`, `request_id`, `severity`, `remediation`).
- [x] Telemetry service captures widget initialization durations via performance tracing.
- [x] Fallback error boundaries capture React render failures via telemetry.
- [x] Virtualization applied on high-volume lists to maintain 60 FPS scrolling.

## 5. Route Protection & Environment Governance
- [ ] Finance middleware guards `/dashboard`, `/invoices`, `/payments`
- [ ] Session cookie established on first visit
- [ ] Role cookie synced with role switcher
- [ ] Unauthorized roles redirected appropriately
- [ ] `NEXT_PUBLIC_STRIPE_KEY` set in deployment environment
- [ ] `STRIPE_SECRET_KEY` set for production payment intents
- [ ] `.env.example` documents all required variables
- [ ] No secrets committed to repository

## 6. Accessibility, Performance & Export Reliability
- [x] Export to CSV supports automatic internal retries to endure transient interruptions.
- [x] Export to PDF supports internal retries.
- [x] Data query layer caches requests and enforces deduplication.
- [x] All chart containers map to keyboard focus paths (`tabIndex={0}`).
- [x] Visual containers implement `role="region"` with accessible labels.
- [x] Focus states are visually evident via standardized ring classes.
- [ ] Keyboard navigation works on forms and buttons
- [ ] Focus rings visible on interactive elements
- [ ] Form inputs have associated labels
- [ ] Error messages use `role="alert"`
- [ ] Color contrast meets WCAG AA for primary text
