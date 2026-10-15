# Render deployment

Create one Docker Web Service from `echerrypick/HomePack`, branch `main`.
Use Frankfurt (EU Central), repository-root `Dockerfile`, and health check
`/healthz`. Leave Docker Command empty; the image starts the Express server,
which serves both the site and API. Render supplies `PORT`.

The image installs the Chromium version matching the locked Playwright package,
including Linux dependencies. It runs as the non-root Node user. Local secrets,
customer PDFs, and temporary files are excluded from the image context.

Start with a temporary Render URL and Stripe test mode. Set `APP_URL` to that
HTTPS origin, `BILLING_ENABLED=true`, and supply the required provider keys from
`.env.example` through Render's private environment settings. Set
`FIREBASE_SERVICE_ACCOUNT_JSON` securely; do not copy a local credential path.
Create a separate Stripe sandbox webhook endpoint for this HTTPS deployment;
the local CLI webhook secret is not its signing secret. Authorise the temporary
domain in Firebase Authentication before testing browser sign-in.

Never commit credentials or set secret Docker build arguments. No API secret
is needed during image build.

Verify health, browser sign-in, retail purchase, report generation, saved report
access, PDF export, and business membership changes on the hosted service.
Measure memory during report generation before finalising server size. A local
Docker engine is required to build-test the image locally; a successful app
build alone does not verify the Linux image.

Keep one instance initially: report jobs execute in process and do not yet have
a durable queue. Deployments or restarts may interrupt an active generation;
cloud storage preserves completed reports but does not resume running work.
Keep live payments and domain cutover pending the hosted checks and resolution
of the launch items in `LAUNCH_READINESS.md` and `PAYMENT_QA.md`.
