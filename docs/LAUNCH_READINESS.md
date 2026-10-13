# Launch readiness — 13 October 2026

**Decision: hold launch.** Local implementation and public-page smoke checks pass, but a complete payment and authenticated journey has not been verified. These changes have not been deployed.

## Confirmed owner inputs

- Not VAT registered (confirmed 13 October 2026). Current advertised GBP amounts remain the total customer prices; checkout does not add tax.
- Domain: ukhomepack.com, registered/managed through names.co.uk. DNS has not been changed.
- Hosting remains undecided. OpenAI Sites was considered, but its current published guidance says Sites must not enable financial transactions, making it unsuitable for this paid membership application. Source: https://learn.chatgpt.com/docs/sites

## Changes made in this review

- Desktop and mobile navigation retain Pricing & membership after login.
- Existing subscribers enter Stripe's plan-change confirmation rather than being blocked by duplicate-subscription checkout.
- Stable monthly GBP prices identify the actual membership after portal changes. Legacy prices must match the advertised amount, currency and monthly interval.
- A dedicated portal configuration permits invoices, payment-method updates, cancellation at period end and switching only between Pro and Agency. Upgrades use immediate invoiced proration; downgrades are scheduled at renewal. Stripe confirmation displays the financial effect.
- Billing management remains available in the profile for both retail and business account settings. PAYG reports are one-off purchases, with no recurring subscription to cancel. PAYG Stripe customer IDs are now saved for invoices and payment management.
- Cancellation scheduling is recorded and shown on the profile. Subscription checkout orders are marked fulfilled; membership tiers share an order identity to reduce duplicate checkout races.
- Firestore account creation uses an allowlist so clients cannot inject billing/development entitlement fields. The admin-email exception requires verified email. Deploying the rules is required for these protections.
- Fixed mobile pricing overflow, split page loading to reduce initial JavaScript, and cleaned up expired job-owner entries.

## Validation performed

- TypeScript check: passed.
- Automated tests: 25 passed, including portal configuration and changed-price tier mapping. Stripe portal tests use a mock client; they do not prove live Stripe behavior.
- Production frontend and server builds: passed. Large chunk warnings remain.
- Browser smoke: 19 routes at desktop 1440px and mobile 390px (38 checks), no uncaught JavaScript errors, no horizontal overflow after the fix. Includes public pages, sample report, signed-out account screens, payment page and not-found view.
- This is a rendering smoke check, not a full accessibility audit or proof of data quality. Signed-in controls, real PDF downloads, external data lookups and completed payments still require end-to-end checks.

## Launch blockers and required work

1. **Stripe integration testing:** local `.env` has no Stripe secret or webhook secret. Configure test keys securely, set billing enabled and a trusted APP_URL, provide a reachable webhook endpoint, and verify Firebase Admin credentials. Test successful and declined purchases, authentication challenges, abandoned checkout/retry, cross-account session rejection, simultaneous checkout, renewals, failed renewals, both tier changes, scheduled downgrade/cancellation, and webhook retry. Confirm legacy subscriptions can use the portal. Then configure live mode separately.
2. **Deploy Firestore rules:** the repository file is not evidence of deployed rules. Validate owner/admin permissions and protected billing fields against an emulator or staging project before deployment. Review historic accounts granted admin access under the previous email exception.
3. **Refunds/disputes:** automatic payment reversal and entitlement revocation are absent. Agree partial/full refund and chargeback behavior, implement event handling, and test retry/idempotency before relying on automatic access removal. Until implemented, an explicit manual refund/revocation process is necessary.
4. **Report persistence and hosting:** completed reports are stored in the browser; jobs and job ownership are held in process memory. Restarting or routing across multiple instances can lose an active job. Choose hosting, durable job execution and report storage before promising reliable account history or uninterrupted generation.
5. **Service protection:** costly external lookup/AI and generation endpoints lack a demonstrated production rate-limit/concurrency policy. Add suitable per-user limits and provider timeouts, plus monitoring and operational alerts. The summary endpoint currently verifies login but not a paid property entitlement.
6. **Business/legal inputs:** confirm legal trading entity, registered address/company number, support mailbox operation, refund policy, processor regions/contracts, and retention/deletion policy. Legal pages require review against actual business operations.
7. **Provider/data and delivery checks:** verify real representative addresses, unavailable-provider states and accuracy/source labels, then test paid report delivery, failed generation/retry, PDF layout/download, white-label branding, account history and mobile logged-in journeys. Gemini key is absent locally; alternative AI providers are configured but not proven by these smoke checks.
8. **Deployment readiness:** confirm production domain, HTTPS, Firebase authorized domains, production secrets, health checks, logs/alerts, backups and rollback. No production environment was inspected or changed.

## What the owner needs to provide

- Configure Stripe test secrets in the server environment; never send secret values in chat.
- Confirm production hosting/domain and provide staging access/test accounts for retail, Pro and Agency.
- Confirm the trading entity details and VAT/refund policy, plus the functioning support mailbox.
- Confirm whether browser-only history is acceptable for launch or durable report history is required. The current pricing promises saved history, so durable storage is recommended before launch.

Technical payment reference: https://docs.stripe.com/api/customer_portal/configurations/create
