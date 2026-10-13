# Payment setup

The application now uses Stripe Checkout and Firebase Admin. Payments fail closed until configured.

## Local development without payments

Set the following values in `.env` and restart the server:

```dotenv
APP_URL=http://localhost:3000
BILLING_ENABLED=false
```

This simulates purchases using separate development entitlements, while retaining Firebase Admin token verification, only when `APP_URL` uses `localhost`, `127.0.0.1` or `::1`. A hosted URL never receives the bypass. Set `BILLING_ENABLED=true` before testing payments or deploying.

1. Set `BILLING_ENABLED=true`, then set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `APP_URL` (the trusted origin, locally `http://localhost:3000`). Use Stripe test mode while testing.
2. Provide Firebase Admin credentials through `FIREBASE_SERVICE_ACCOUNT_JSON` or Application Default Credentials (`GOOGLE_APPLICATION_CREDENTIALS`). They must have access to the project and named database in `firebase-applet-config.json`. Never expose these credentials through Vite variables.
3. Register `/api/billing/webhook` with Stripe for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.updated`, and `customer.subscription.deleted`. The server creates stable GBP monthly prices and a dedicated Stripe portal configuration for invoices, payment methods, cancellation and switching between the two membership tiers. Give the server key access to products, prices and portal configurations. Upgrades are prorated and invoiced immediately; downgrades are scheduled at period end; cancellation stops renewal at period end. Webhooks map the actual price to the tier rather than stale Checkout metadata. Existing legacy inline prices are recognised only when amount, currency and interval match. Test legacy subscriptions in the portal before launch.
4. Deploy `firestore.rules` to the configured database before enabling checkout. Users must not be able to edit purchase or subscription fields. No rule deployment was performed as part of the local code changes.
5. Restart the application server. Its dev command does not automatically restart Express after edits.

Amounts are GBP 999 / 4900 / 7900 pence. The owner confirmed on 13 October 2026 that the business is not VAT registered. No VAT is added at checkout; the advertised amounts are the total customer prices. Review this configuration if registration changes. Stripe product prices are created from server constants, never client input.

PAYG access uses a normalised complete-address key including flat/house, street, town and postcode. It never uses postcode-only matching. There is no authoritative address/UPRN resolver in this app; alternate spellings can still produce distinct keys. Resolve addresses against an authoritative directory before switching identity to UPRN.

Old `purchasedReports` values were client-writable and did not represent verified payments. They are deliberately not migrated into paid entitlements. Existing subscriptions without verified Stripe billing also require reconciliation. Validate actual payment records before granting access manually.

Validation before going live: sign in as two test accounts; buy property A; confirm automatic generation; return to A; choose property B at the same postcode and confirm new checkout; cancel checkout and confirm no job; retry failed generation; verify another account cannot poll a job or confirm the first account's session; exercise subscription renewal, cancellation, failed payment, and webhook retries.

Remaining business inputs: legal entity name, registered address/company number, active support mailbox, VAT treatment, processor contracts/regions and retention periods. The legal pages are improved service descriptions, not a completed legal approval. Refund/revocation handling and durable cloud report storage are not implemented; recent report bodies are saved per account in the browser. Refunds require manual entitlement revocation pending an automated policy.

## Account classification and upgrade journey

Retail users choose a business plan on the pricing page and complete verified checkout. Account type is not a permitted client profile update. Firestore rules only allow consumer classification on self-created free accounts and prevent owners from changing classification after creation. Deploy these rules before launch; changing the local file does not deploy them.

The account page derives classification from active, unexpired membership access rather than trusting a historical accountType preference. Scheduled cancellation retains business access through the paid period. Subscription synchronization sets inactive accounts back to consumer; purchased property keys are retained. Local simulated entitlements affect classification only when the server reports local payment simulation enabled.
