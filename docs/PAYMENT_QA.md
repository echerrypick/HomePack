# Stripe sandbox payment review — 15 October 2026

No live keys or real-money payments were used. Checks ran against the local app, real Stripe sandbox Checkout/portal pages, the Stripe CLI webhook forwarder and isolated temporary Firebase accounts. Account changes were written only to sandbox billing collections. This is not evidence of production deployment or complete browser journey coverage.

## Passed checks

- Hosted £9.99 report Checkout: declined test card displayed an error and left access locked; a subsequent 3D Secure test payment completed successfully.
- Actual Checkout completion webhook unlocked only the exact purchased property. Another property and a different account remained locked. Cross-account payment verification was rejected.
- The paid retail account generated a complete report. Its job/result remained accessible after server restart, and another account could not read the job.
- Hosted £49/month Business checkout completed and activated business access.
- Hosted Business Plus confirmation displayed £30 immediate proration and £79/month thereafter. Confirmation activated Business Plus.
- Hosted downgrade displayed £49/month starting at renewal and preserved Business Plus access until then. A separate test-clock simulation verified the actual tier transition at renewal.
- Hosted cancellation after a scheduled downgrade preserved paid access and scheduled service end. A separate test clock verified removal of business access at period end.
- Successful test-clock renewal extended membership expiry. A declined renewal changed the Stripe subscription to past_due and removed business access; payment recovery restored it.
- Replaying an actual paid Checkout event twice did not duplicate the property entitlement. A signed event from the wrong payment environment was rejected.
- A cancelled member could rejoin. Repeated rejoining reused a single pending Checkout after the fix below.
- Separate opt-in API regression checks passed for all three GBP prices, unpaid access denial, session reuse, cross-account rejection and sandbox/live isolation.

## Defects found and fixed

1. Stripe can represent portal cancellation after a scheduled downgrade using cancel_at while cancel_at_period_end is false. The app now recognises either representation, shows the pending cancellation, and caps entitlement expiry at the explicit cancellation date. Unit regression tests and a real sandbox webhook check passed.
2. A new subscription attempt inherited the prior order's paid marker. Repeated attempts therefore skipped pending-session reuse and could open duplicate Checkouts. New attempts now start unpaid. The expanded sandbox integration test verifies reuse after a prior paid order.

## Refund observation and remaining launch checks

A full sandbox refund succeeded in Stripe, but property access remained in the app. Refund/dispute entitlement automation is still absent. Before launch, agree the full/partial refund and dispute access policy and either implement it or establish a documented manual revocation process. A Stripe refund alone must not be presented as automatic access revocation.

Still required: signed-in browser return/automatic-generation/PDF journeys on the deployed staging site, mobile signed-in checks, concurrent checkout stress/race cases, production HTTPS webhook configuration and retries on the chosen host. Lifecycle API/test-clock tests complement the hosted portal checks; they do not prove every production failure mode.

Temporary test users, report records, pending Checkouts, customers, test clocks and active test subscriptions are removed/cancelled after the review. Stripe retains historical sandbox payments/invoices/events, including the test refund, for audit.

## Repeatable repository checks

- Type check and unit suite, including subscription-timing regression cases.
- Opt-in sandbox Checkout checks: RUN_STRIPE_INTEGRATION=1 node --import tsx tests/integration/stripe-checkout.ts (requires the local app, test credentials and webhook listener).
- Report storage integration: RUN_FIRESTORE_INTEGRATION=1 node --import tsx tests/integration/report-storage.ts.
