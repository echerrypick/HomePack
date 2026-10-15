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

## Update — 14 October 2026: Firestore report history

Cloud report storage and account history are now implemented and tested against the existing named database using isolated temporary records (removed after testing). Compact paginated summaries, compressed on-demand payloads, unchanged-body write avoidance and a bounded per-session cache reduce reads and storage. Job start and terminal states persist; interrupted generation is retryable but still needs a durable worker queue for automatic recovery. See `FIRESTORE_STORAGE.md`.

Rules testing/deployment and index/TTL deployment remain blocked by the available identity's permissions. No rules, index or TTL changes were deployed. The Firebase console signed-in account also requests project-owner management access. This supersedes the browser-only-report-storage blocker above, but does not remove the queue, permissions, payment or other launch blockers.

## Deployment update — 14 October 2026

The named database uses Enterprise edition in Native mode, in europe-west1. All 21 Firebase Rules API tests passed; the protected-field/report security rules were published and read back successfully. Two minimal Enterprise indexes (history and temporary-job expiry) were built and verified READY. A post-deployment live test confirmed storage, pagination, account isolation and expired-job cleanup. All temporary fixtures were removed. Managed TTL is unavailable while billing is disabled; the app now performs a bounded indexed cleanup at startup and daily, retaining saved reports. No billing plan was changed. This supersedes the permission/index deployment blocker in the preceding update. Durable worker execution and the remaining payment/launch checks are still required.

Temporary Firebase Rules Admin and Cloud Datastore Index Admin roles were removed after deployment; original runtime roles were preserved and verified in IAM.

## Stripe connection update — 14 October 2026

Stripe test credentials are valid, local webhook forwarding is running, and the signing secret is stored privately. Local payment simulation has been replaced by Stripe sandbox checkout. Test billing data is isolated from live customer/entitlement records. Test catalog and portal configuration passed against Stripe; signed webhook acceptance and invalid-signature rejection passed. Sandbox API checks confirmed all three GBP prices, same-checkout reuse, replacement of an abandoned Pro checkout when Agency is selected, unpaid access denial and cross-account session rejection. Temporary test identities/order records were removed and unpaid sessions expired. No real payments were made. Full card checkout/delivery, renewal, plan-change, cancellation, refund/dispute and live deployment checks remain required. This supersedes the earlier missing-test-key setup blocker, not the end-to-end payment launch blocker.

## PDF/data review — 14 October 2026

The supplied 21 High View Close report exposed a domestic-only EPC lookup. The exact address is present in the non-domestic register; its certificate UPRN also resolves the combined-premises Ofcom broadband/mobile record. Generation now checks the non-domestic register when domestic search has no exact result. Certificate selection requires the requested premises instead of silently choosing a neighbour or the only postcode result. Non-domestic asset scores, absent potential ratings and certificate expiry are labelled explicitly; no default energy band is invented. The verified commercial certificate used in this review expired on 6 January 2026.

The VOA lookup still has no exact council-tax match; business rates may apply and must be verified. Radon, coal mining and ground stability remain unassessed where no official property-level integration is connected. An empty planning response is not proof that no applications or constraints exist.

PDF export now waits for fonts/images, isolates its typography from the website, preserves A4 proportions, restores the hidden template even on errors, and rejects body/footer collisions or vertically overflowing pages instead of silently cropping them. The reviewed ten-page report and missing-data variant were exported through the shared production exporter. Reopening an older saved report does not refresh its dataset: regenerate it to obtain the new EPC/connectivity lookup. Further coverage testing remains necessary for other properties and unusually long source records.

## Planning coverage and report wording — 15 October 2026

Live checks found PlanIt initially returning HTTP 503, then responding successfully. At High View Close the connected sources returned 17 unique applications within 0.3 miles; none matched the standard property/same-street scope. A central London control returned four Planning Data constraints. These checks verify positive record flow and scope filtering, not comprehensive local-authority coverage or provider uptime.

Planning source failures are now persisted as incomplete coverage, independently of successful empty results. Missing coordinates, malformed responses and bounded/truncated responses are identified. Search timestamps, scope and nearby records excluded by the street scope are retained in compact report metadata. The standard scope no longer treats a nearby application at the same coordinate as property-linked without an explicit property link. The PDF identifies its three-entry planning summary and refers to the full online list when more records exist.

Online reports/PDFs distinguish no matching results, incomplete searches and specialist checks not included in the connected sources. Older saved reports without source-status metadata show coverage as unverified. Pricing/features explain that licensed radon, mining and ground-stability searches are not included. Summary instructions receive planning source status and must not infer clearance from missing data. Provider reliability and fuller authority coverage remain launch considerations; an unavailable application service must not be marketed as a completed planning-history search.

## Payment lifecycle review — 15 October 2026

Real Stripe sandbox hosted Checkout and portal tests, actual webhook delivery, test-clock lifecycle tests and authenticated report APIs passed for the scenarios in `PAYMENT_QA.md`. Two defects were fixed: explicit-date scheduled cancellations were missed by the profile, and rejoining after a prior paid membership could create multiple pending Checkouts. Regression checks cover both. The paid retail report was generated and survived a server restart. These results supersede the earlier untested status only for the listed scenarios. Full refund testing confirmed Stripe refunds do not automatically revoke report access; refund/dispute handling, deployed signed-in browser journeys, concurrent checkout cases and production hosting/webhooks remain launch work.
