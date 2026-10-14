# Firestore report storage — 14 October 2026

Project: `homepack-ac820`. Edition: **Enterprise, Native mode**, region `europe-west1`, billing disabled/free-tier-limited as verified during setup. Named database: `ai-studio-7664f6c9-0863-422b-97d6-4c046e81f35c`.

## Data model and efficiency

- `users/{uid}/reports/{opaquePropertyAndScopeHash}`: compact metadata only, ordered by completion time. One latest report per normalized property and planning scope. Regeneration replaces that saved version; download PDFs to preserve earlier versions. Different flats and planning scopes remain distinct.
- `.../reports/{id}/reportChunks/{index}`: gzip-compressed JSON bytes, at most 700,000 bytes per document. Normal reports use one chunk; oversized reports split into bounded chunks. The delivered property data and summary are retained; diagnostic logs are omitted. Content hashes prevent rewriting an unchanged body. A transaction atomically replaces metadata and chunks and removes surplus chunks when a new report shrinks.
- `users/{uid}/reportJobs/{jobId}`: small start/terminal state only, without report bodies. Marked for expiry seven days after creation/update via `expiresAt`. Because this project has billing disabled, managed Firestore TTL cannot be enabled. The app runs an indexed cleanup pass at startup and once daily, deleting at most 1,000 expired job records per pass in batches of 100. Saved reports and unexpired jobs are retained. Cleanup runs only while an app server is running; deployment monitoring must surface cleanup failures/backlogs.
- Profiles no longer accumulate growing search-history/address arrays and per-property counters. Existing historical fields are left intact. New searches update the scalar search counter only; report history is read from the report collection.

History fetches 20 metadata documents per page, using a cursor rather than an offset. Fetching is lazy on account/tool/history routes, once per signed-in session until Refresh or Load older reports. Full bodies load only when opened. The five most recently opened bodies are cached in memory for that account/session; simultaneous opens share a request. New report bodies are not duplicated into browser storage. Existing browser-only reports remain available on their original device and are clearly labelled; unverified browser content is not silently uploaded as a server-generated report.

Typical storage-specific operations (excluding authentication, access checks and profile counters; these are logical document operations, not a billing-unit estimate for Enterprise edition):

- Initial save: one metadata transaction read, one metadata write, usually one chunk write. A transaction retry can add reads.
- Job lifecycle: one start write and one terminal write. Progress polling reads server memory, not Firestore. A missing in-memory job falls back to the database at a reduced poll frequency.
- History: up to 20 small document reads per requested page. Enterprise edition meters read units by data processed; use measured usage for cost estimates.
- First open: one metadata read plus one read per compressed chunk. Reopening an unchanged cached report requires no report-body database reads. Cache resets on sign-out/page reload.
- No realtime report listener, per-checklist-step writes, automatic cloud upload of old local reports, or automatic enumeration of the entire archive.

This Enterprise database does not automatically index document fields. `firestore.indexes.json` therefore defines just two explicit indexes: descending completion time/document ID scoped to each reports collection, and ascending expiry/document ID across the reportJobs collection group. Both were deployed and verified READY. Report payload bytes and other unqueried fields remain unindexed. Standard-edition field-index overrides were removed after identifying the edition. No managed TTL policy or billing change was enabled.

## Security and deployment status

The server verifies Firebase ID tokens and derives all report/job paths from the verified UID. Report IDs and cursor parameters are validated. Clients cannot choose another account's UID or upload report bodies. New nested report collections are denied direct client read/write in the prepared rules; the authenticated API uses Admin SDK access.

Live storage tests passed against isolated fictional records in the configured database, covering compression round-trip, unchanged-payload write avoidance, owner isolation, cursor pagination including equal timestamps, durable completion, interrupted-job handling and chunk shrinking. Every test document was removed. Codec tests cover compression, scope/flat separation, chunk bounds and integrity checks. Browser fixture tests cover lazy history loading, pagination, cached report reopening, errors and mobile layout.

**Deployed on 14 October 2026:** security rules release `projects/homepack-ac820/rulesets/75655d1e-2afa-45b1-a86d-81e0f43bd3e8`, verified by reading back the named database release and comparing the source. All 21 Firebase Rules API tests passed, including profile edits, protected billing/identity fields, cross-account access, report/job denial and verified admin access. The preceding ruleset is retained for rollback: `697d7e7c-ca66-4602-9cf7-29c1a6a52518`.

History index `CICAgOjXh4EK` and cleanup index `CICAgOi3kJAK` are READY. Live integration tests passed after deployment and confirmed expired-job cleanup preserves fresh jobs and report bodies. All synthetic test records were removed. The two temporary deployment roles were removed after verification. The IAM console now shows only the pre-existing Firebase Admin SDK Administrator Service Agent and Service Account Token Creator roles.

Deploy with an authorized Firebase CLI session from this repository:

```
firebase deploy --only firestore --project homepack-ac820
```

The `firebase.json` configuration targets the named database explicitly. Do not inadvertently deploy to `(default)`.

## Generation reliability limit

Completed reports survive server restart and are available from account history on another device. Generation itself still runs in the web process. Persisted job state allows an interrupted job to be identified and retried after ten minutes; it does not resume provider execution or create a durable worker queue. A durable queue/worker and controlled concurrency remain launch work. Expired terminal job checkpoints are removed by the bounded daily app cleanup task. No report bodies are deleted by that task.

## Re-run checks

```
node --import tsx --test tests/*.test.ts
RUN_FIRESTORE_INTEGRATION=1 node --import tsx tests/integration/report-storage.ts
```

The integration test uses the configured database, writes under an isolated test UID, and removes only its own test subtree in `finally`. It is opt-in and is not part of the ordinary unit test command.

References: [Firestore best practices](https://firebase.google.com/docs/firestore/best-practices), [Enterprise indexing](https://firebase.google.com/docs/firestore/enterprise/index-overview-native), [Enterprise pricing](https://firebase.google.com/docs/firestore/enterprise/pricing), [limits](https://firebase.google.com/docs/firestore/quotas).
