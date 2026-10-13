# Stage 08 verification record

Date: 2026-10-02 (Asia/Shanghai)

This stage hardens the image delivery boundary and keeps real OpenLux calls disabled by default. The route and provider are ready for offline contract tests; no paid or external request was made.

## Evidence level

- The three model IDs are user-provided allowlist values (B/C evidence).
- The request field names are user-provided example fields (C evidence).
- The OpenLux endpoint, authorization convention, reference-image contract, asynchronous task contract, URL lifetime and price limits are not verified in this repository. They remain configuration requirements, not defaults.
- No `openluxskill` file was present in the inspected local skill/research roots during this stage.

## Implemented

- `app/lib/server/openlux.ts` now has a provider-only adapter, explicit error codes, input validation, safe response parsing, retryability and an intentional empty endpoint default.
- `app/api/image-generation/route.ts` rejects oversized JSON, unknown models and unverified reference-image fields, maps provider errors to safe HTTP responses, and never returns credentials.
- `.env.example` documents empty endpoint placeholders and the disabled default.
- `app/lib/server/openlux.test.ts` exercises disabled calls, request mapping, URL and base64 fixtures, malformed/empty responses, validation and rate-limit mapping with local fake fetch only.

## Checks

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed: 21 tests in 4 files.
- `npm run build` passed with Next.js 16.3.7; `/api/image-generation` is a Node.js route handler.
- No real credentials were read. Static source and test outputs contain no configured credential value; runtime credential leakage was not testable without a credential.
- Playwright CLI opened `/studio` at 1280px, submitted the Quick mode Mock flow, and confirmed the session card, snapshot disclosure, Mock label and no-download message. Previous Stage 07 evidence covers 360px and 390px overflow, expert editing and mode switching; this stage did not repeat those viewport checks.

## Remaining boundary

The browser currently submits Mock jobs and displays placeholder cards. Real image preview/download remains closed until the official OpenLux endpoint, authentication, response/resource lifetime and one explicitly authorized paid test are confirmed. Reference images are not accepted by this route until the provider contract confirms their format and model support.

No payment, video provider, social publishing, deployment, commit or push was performed.
