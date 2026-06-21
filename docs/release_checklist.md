# Release Checklist — LTI Finance Portal (P6)

## Pre-Release Validation

### Dashboard
- [ ] Dashboard loads KPI cards without errors for all roles
- [ ] MRR and AR aging charts render for roles with report access
- [ ] Recent invoices list displays correctly
- [ ] Overdue alert banner appears when overdue invoices exist
- [ ] Role switcher updates permissions without page crash

### Payment
- [ ] Client checkout loads invoice by number lookup
- [ ] Stripe Elements card form renders with env key (`NEXT_PUBLIC_STRIPE_KEY`)
- [ ] Payment uses `stripe.confirmPayment()` lifecycle (not simulated timeout)
- [ ] Successful payment records ledger entry and marks invoice PAID
- [ ] Manual wire reconciler records payment on payments page
- [ ] Payment intent API route responds with client secret

### Invoice
- [ ] Invoice list loads with search, filter, and sort
- [ ] Invoice builder creates draft invoices
- [ ] Invoice detail panel updates status correctly
- [ ] Pay link routes to client checkout for eligible invoices

### API Verification
- [ ] Response envelope returns `{ success, message, data, metadata, errors }`
- [ ] Error responses include `trace_id`, `error_code`, and `remediation`
- [ ] Mock provider isolated from API client layer
- [ ] Query client deduplicates concurrent requests

### Route Protection
- [ ] Finance middleware guards `/dashboard`, `/invoices`, `/payments`
- [ ] Session cookie established on first visit
- [ ] Role cookie synced with role switcher
- [ ] Unauthorized roles redirected appropriately

### Environment Governance
- [ ] `NEXT_PUBLIC_STRIPE_KEY` set in deployment environment
- [ ] `STRIPE_SECRET_KEY` set for production payment intents
- [ ] `.env.example` documents all required variables
- [ ] No secrets committed to repository

### Accessibility
- [ ] Keyboard navigation works on forms and buttons
- [ ] Focus rings visible on interactive elements
- [ ] Form inputs have associated labels
- [ ] Error messages use `role="alert"`
- [ ] Color contrast meets WCAG AA for primary text

### Performance
- [ ] Dashboard charts lazy-loaded via dynamic import
- [ ] KPI cards use memoized subcomponents
- [ ] Build completes without bundle warnings

### Error Monitoring
- [ ] API failures logged via error monitor
- [ ] Payment failures tracked with invoice context
- [ ] Render failures captured in development console

## Sign-Off

| Area | Owner | Status | Date |
|------|-------|--------|------|
| Dashboard | Frontend | | |
| Payment | Frontend | | |
| API Contract | Frontend | | |
| Security | Frontend | | |
| QA | Reviewer | | |
