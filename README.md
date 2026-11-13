# Cardeo

An unofficial Slay the Spire 2 shop demo for Hong Kong. Browse 30 curated cards, filter by character/price, manage a persistent cart, and complete a server-validated simulated order. No real payments, deliveries, accounts or customer details.

## Run locally

Requires Node.js 20.19+ and npm. Node.js 22 is used in CI.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No account, API key or separate database install is needed locally. PGlite runs real PostgreSQL in-process and persists catalogue/orders in the ignored `.cardeo/` directory. Run only one application server against that directory at a time.

The frontend is Next.js App Router, React, TypeScript and Tailwind CSS. Checkout is a Node.js Route Handler. The same PostgreSQL schema and checkout function run locally and on Supabase; embedded storage is never used on Vercel.

## Features

- Traditional Chinese interface; original English card names.
- Traditional Chinese / English interface with a persistent language switch. Card names and reference artwork retain their source language.
- Home, catalogue, individual card URLs, cart, checkout, receipt, credits, missing-page and error states.
- Live database catalogue through `GET /api/catalogue`, with loading and retry states.
- Search, character/maximum-price filters, sorting, pagination and URL-preserved selections.
- Tiers stay inside the database; public catalogue and checkout responses omit rankings.
- Mobile filter drawer with explicit apply/cancel and native keyboard focus handling.
- Browser-persisted cart, 1–10 units per product, up to 30 different products.
- Server-calculated tier prices, requote before accepting changed totals, failed/successful checkout simulation.
- Atomic order/item writes, unique-request idempotency, historical price snapshots, database-backed rate limits.
- Private tables and RPC functions: no anonymous order access or direct writes.

Tier prices are fictional: S HK$100, A HK$75, B HK$50, C HK$25, D HK$10. The reference is [Mobalytics](https://mobalytics.gg/slay-the-spire-2/tier-lists/cards); verified mappings and snapshot metadata are recorded in `docs/tier-snapshot.json`. Prices from the supplied HTML sample are intentionally not imported.

The supplied sample has no verified rarity/type/energy metadata. Those facets are deferred until a trustworthy metadata import exists; the app does not invent gameplay stats. The first release uses 30 verified cards, not all 424 cards from the sample.

## Artwork

The app uses the reference image URLs provided in `Downloads/sts2-merchant-shop`, through Next.js image optimization. Images fall back to original geometric motifs if unavailable. To use only those original motifs, add this to `.env.local` and restart:

```dotenv
REFERENCE_ART=false
```

Card artwork and game material belong to their respective rights holders. Attribution does not establish permission. Confirm final image permissions before publishing the reference artwork. The app is not affiliated with Mega Crit or Mobalytics. See `docs/design.md` for the visual direction and source details.

## Check the implementation

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

`check` runs lint, TypeScript, unit/database tests and a production build. Browser tests use installed Google Chrome locally, visibly, in an isolated test profile. Set `PW_CHANNEL=chromium` to use the installed Playwright Chromium instead. CI uses headless Playwright Chromium. Browser tests start the production app at http://127.0.0.1:3100; run the build first. Port 3100 must be free. Each browser run uses its own temporary database, so checks cannot modify your local shop data or inherit prior rate limits.

Database tests execute the actual migration and checkout SQL in an isolated in-memory PostgreSQL instance. They cover price tampering, unavailable/unranked cards, retries, request conflicts, price snapshots, rollback, rate limiting and anonymous permission denial. Browser tests cover the full shopping flow, failure/retry, cart persistence, malformed storage, filter apply/cancel, 320 px layouts, request validation and screenshot capture.

Generated screenshots are under `.artifacts/screenshots/`. Override with `CARDEO_SCREENSHOT_DIR` when needed. Test output, local database files and secrets are ignored by Git.

## Deploy

Follow [the deployment guide](docs/deployment.md). Vercel requires a configured Supabase database and `CHECKOUT_RATE_SECRET`; it deliberately refuses local-file persistence. No payment gateway account is required.

The existing release workflow is preserved. CI validates pull requests without hosted database credentials. No public deployment, remote database provisioning or credential configuration is implied by the local build.

## Project documents

The `docs/` directory is local and ignored by Git; these files are not included in a fresh clone.

- `docs/design.md`: visual direction and changes from the supplied HTML sample.
- `docs/tier-snapshot.json`: curated tier evidence and verification dates.
- `docs/deployment.md`: hosting, database, domain and operation steps.
- `docs/plan.md`: approved planning baseline and initial wireframes.
- `supabase/migrations/001_shop.sql`: schema, permissions and transactional checkout.
- `supabase/migrations/002_private_rankings.sql`: public catalogue and receipt projection without tiers.
- `supabase/seed.sql`: initial tier prices and catalogue.

## Project structure

- `src/app/`: routes, API handlers and global styles.
- `src/app/components/`: UI grouped into catalogue, cart, checkout, layout and i18n; component unit tests belong beside their components.
- `src/server/`: server-side API handlers, database access, checkout validation and language lookup.
- `src/lib/`: shared types and translations.
- `tests/integration/`: PostgreSQL integration tests.
- `tests/e2e/`: browser flow and visual checks.
- `configs/`: ESLint, Vitest and Playwright configuration.
- `supabase/`: migrations and seed data; kept at root for Supabase tooling.
- `public/`: static assets; kept at root for Next.js.
- `docs/`: product and deployment documents.
- `.artifacts/`: ignored browser captures and test output.

Next.js, TypeScript and PostCSS configuration files stay at the project root for framework and editor discovery. Next.js generates the ignored `next-env.d.ts` file.

`npm test` discovers colocated unit tests and database integration tests. `npm run test:e2e` discovers browser tests under `tests/e2e/`.
