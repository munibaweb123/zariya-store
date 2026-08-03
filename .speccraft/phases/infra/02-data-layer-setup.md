# Phase: infra/02 — Data Layer Setup

**Branch:** `feature/infra/data-layer-setup`
**Depends on:** None (foundation phase)
**Effort estimate:** M — Sanity project + Studio + schema, Prisma schema + Neon Postgres connection + initial migration.

---

## Architectural Role

Stands up the two persistence systems the product depends on: Sanity for the content the store owners edit themselves, and Postgres for the orders the site writes. No page can fetch a product or create an order until this phase exists.

## Domain Ownership

- `sanity.config.ts` + `app/(studio)/studio/[[...tool]]/page.tsx` — embedded Sanity Studio (via `next-sanity`'s `NextStudio`), reachable at `/studio`, isolated from the storefront via Next's **multiple root layouts** pattern — `app/(storefront)/` now holds `infra/01`'s root layout/page (moved, unchanged behavior), and `app/(studio)/layout.tsx` is a separate, independent root layout with no Nav/Footer/announcement bar. A single shared root layout can't let a child route opt out of what it renders, so this was the only way to make `/studio` genuinely standalone.
- `components/studio/StudioClient.tsx` — `'use client'` wrapper that owns the `sanity.config` import and `<NextStudio />` render. Discovered as necessary during implementation: `sanity.config.ts` must never be imported from a Server Component — Turbopack traces a Server Component's whole import graph for RSC bundling, and `sanity`'s internal code imports a client-only `swr` hook that breaks under that trace. Keeping the import inside a Client Component means Turbopack only ever bundles it for the browser, where that hook is valid.
- `sanity/schemaTypes/product.ts` (+ index) — product schema: `name`, `slug`, `price`, `salePrice`, `category`, `images`, `description`, `inStock`, `featured`
- `lib/sanity/client.ts` — server-only Sanity client
- `lib/sanity/queries.ts` — typed query helpers (server components / server-side helpers only), using time-based ISR (`next: { revalidate: <fixed window> }`), no webhook or route handler
- `scripts/seed.ts` — one-off/re-runnable Sanity seed script that writes clearly-marked sample product documents into the dataset; never imported by app code
- `prisma/schema.prisma` — `Order` model (no `url`/`directUrl` in its `datasource` block — Prisma 7 moved connection config out of the schema file)
- `prisma.config.ts` — CLI/migration-time connection config, pointed at `DIRECT_URL`
- `lib/prisma.ts` — Prisma Client singleton (`globalThis`-cached, exactly one instance for the whole app), constructed with a `@prisma/adapter-pg` adapter over `DATABASE_URL` (pooled) — Prisma 7 requires a driver adapter for Postgres, this is the standard one (not the Neon-specific `@prisma/adapter-neon` that was already ruled out)
- `lib/orders.ts` — `generateOrderNumber(date?: Date): string` (the `ZR-YYMMDD-XXXX` format, single source so `frontend/06` never reimplements it)
- `next.config.ts` — `images.remotePatterns` entry for the Sanity CDN hostname
- `.env.local` (+ `.env.example`) — `DATABASE_URL` (Neon pooled, app runtime), `DIRECT_URL` (Neon direct, migrations only), `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_TOKEN` (server-only, never `NEXT_PUBLIC_*`)

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import it.
- Do not build any page or route that consumes this data — no home/category/product/checkout UI. That's `frontend/01` onward.
- Do not build the order-creation server action — this phase owns the `Order` **schema** and the Prisma client singleton only; the server action that writes an order belongs to `frontend/06-checkout-page`.
- Do not add a standalone Sanity Studio project/repo — the embedded-route decision means Studio config lives inside this app only.
- The `/studio` route must not render the storefront's announcement bar, `Nav`, or `Footer` — implemented via Next's multiple-root-layouts pattern (`app/(storefront)/` vs `app/(studio)/`, each with its own independent root layout), since a single shared root layout cannot let a child route opt out of what it renders.
- Do not import `sanity.config.ts` (or anything that transitively imports it) from a Server Component. It must only ever be imported from `components/studio/StudioClient.tsx` (a `'use client'` file) — otherwise Turbopack traces the whole Studio dependency graph for RSC bundling and breaks on an internal client-only `swr` import inside `sanity`.
- Do not add Sanity webhooks or a revalidation route handler — content freshness is time-based ISR only, decided above.
- Do not add Sanity Studio authentication/access-control beyond Sanity's own built-in project-member login — no custom accounts (Out of Scope).
- Do not use `@prisma/adapter-neon` or `@neondatabase/serverless` — those are Neon's specialized edge/WebSocket driver, ruled out per the connection-strategy decision above. (`@prisma/adapter-pg` + `pg` is a separate, required thing — Prisma 7 has no adapter-free `PrismaClient` for Postgres at all, discovered during implementation; see Architectural Constraints.)
- Do not add product variants (size/volume) to the schema — confirmed out of v1 scope; size/volume differences are separate products.
- Do not hardcode product data in component code or in the storefront's source. If sample content is needed for downstream phases to build against, ship it as a Sanity seed script (`scripts/seed.ts`) that writes documents into a Sanity dataset, clearly marked as sample data and runnable/re-runnable on demand. It must never be imported by app code.
- Do not query Sanity from client components. All product fetching happens in server components or server-side helpers in `lib/sanity/`.
- Do not expose the Sanity write token to the client. Only the read-only `projectId`/`dataset`/`apiVersion` may be `NEXT_PUBLIC_*`; any token stays server-only.
- Do not use Sanity's CDN URLs in `next/image` without adding the hostname to `next.config`'s `images.remotePatterns` — that config change belongs to this phase, not to the page phases that consume it.
- Do not run `prisma migrate` through the pooled `DATABASE_URL` — migrations use `DIRECT_URL` only.
- Do not create more than one `PrismaClient` instance. `lib/prisma.ts` exports a `globalThis`-cached singleton; no phase may instantiate its own.
- Do not commit `.env.local` or any real Sanity/Neon credentials — only `.env.example` with placeholder keys.

## Core Capabilities

1. **Sanity project connection** — `sanity.config.ts` reading `projectId`/`dataset`/`apiVersion` from the `NEXT_PUBLIC_SANITY_*` env vars, with the minimal plugin set needed for content editing (structure tool; no extras).
2. **Embedded Studio route** — `app/(studio)/studio/[[...tool]]/page.tsx` renders `components/studio/StudioClient.tsx` (a `'use client'` wrapper around `next-sanity`'s `NextStudio`), under `app/(studio)/layout.tsx` — its own independent root layout (no announcement bar/Nav/Footer) via Next's multiple-root-layouts pattern — so Studio renders as a fully standalone admin surface.
3. **Product schema** — exactly the eight fields already fixed in CLAUDE.md's Content section, no more: `name`, `slug`, `price`, `salePrice`, `category`, `images`, `description`, `inStock`, `featured`. Do not add fields beyond this list (e.g. no separate "bestseller"/"new arrival" flags — home page derives those groupings from `featured` and recency using only these fields). `category` is a fixed-list string field (not a referenced/manageable taxonomy) with exactly these four slugs, matching `infra/01`'s nav hrefs and `frontend/02`'s `/category/[slug]` routes exactly: `dresses`, `perfumes`, `beauty`, `jewellery`. A mismatch here would silently produce empty category pages, so these four strings are the fixed contract between this schema and both of those phases.
4. **Sanity client + typed query helpers** — `lib/sanity/client.ts` (server-only client) and `lib/sanity/queries.ts` (typed fetch functions per query, e.g. get-product-by-slug, list-products-by-category, list-featured), each using `next: { revalidate: <fixed window> }` for ISR.
5. **Sample data seed script** — `scripts/seed.ts`, run on demand (e.g. `npx tsx scripts/seed.ts`) via the Sanity client with a token, writing a handful of sample products across the four categories so `frontend/01/02/04` have real data to build against before the owners populate the real catalog. Clearly marked as sample/seed data, safely re-runnable, never imported by application code.
6. **Order schema (Prisma)** — `prisma/schema.prisma`'s `Order` model:
   - `orderNumber` (unique, human-readable) — see the generation strategy below
   - contact fields: `customerName`, `phone`
   - delivery fields: `address`, `city`, `province`, optional `landmark`
   - `paymentMethod` (COD default / bank transfer secondary)
   - optional `notes`
   - a snapshot of ordered items (product slug/name/price/qty at order time — no relational FK into Sanity, since products live in a different datastore)
   - `subtotal`, `deliveryCharge`, `total` — stored separately, not just the final total, so an order remains auditable later
   - `status` — string/enum, default `pending`, values `pending | confirmed | shipped | delivered | cancelled`; reflects where each manually-confirmed-on-WhatsApp order currently stands
   - timestamps (`createdAt`, `updatedAt`)

   **Order number generation strategy:** generated server-side *before* insert — not derived from the autoincrement `id` — as `ZR-<YYMMDD>-<4 random uppercase alphanumeric chars, excluding ambiguous 0/O/1/I>` (e.g. `ZR-260803-K7QF`). A unique constraint on the `orderNumber` column enforces collision-safety; on the rare collision, regenerate and retry up to 3 times. This keeps number generation decoupled from the insert (no two-step create-then-update needed) and, unlike an id-derived number, never reveals the store's total order count to a customer (`ZR-1001` on day one would advertise "first order ever" — a small but real trust problem for a new boutique).
7. **Neon Postgres connection** — pooled `DATABASE_URL` for app runtime, separate `DIRECT_URL` for `prisma migrate`; initial migration creating the `Order` table.
8. **Prisma Client singleton** — `lib/prisma.ts`, `globalThis`-cached so Next.js dev hot-reload doesn't spawn multiple clients/connections.
9. **Image domain config** — `next.config.ts`'s `images.remotePatterns` updated with the Sanity CDN hostname, so `next/image` can render Sanity-hosted product photos.
10. **Environment variable wiring** — `.env.example` documenting every var from Domain Ownership with placeholder values; real `.env.local` gitignored (already covered by `infra/01`'s `.gitignore` fix).

## Service Interactions

- **Upstream:** none — foundation phase, no dependencies. (`infra/01` exists in parallel with no dependency relationship, except that the `/studio` route must actively *avoid* `infra/01`'s root layout — see below.)
- **Isolation from `infra/01`'s layout:** `app/(studio)/layout.tsx` is its own root layout and must **not** import or render `infra/01`'s `Nav`/`Footer`/announcement bar (now living in `app/(storefront)/layout.tsx`). This is an avoidance contract, not an integration — Studio is a standalone admin surface, not a storefront page.
- **Downstream — product data (`frontend/01`, `frontend/02`, `frontend/04`):** these import `lib/sanity/queries.ts`'s typed fetch functions to get product data, and rely on this phase's `next.config` `images.remotePatterns` entry so `infra/01`'s `ProductImage` component can render Sanity-hosted photos without further config changes on their part.
- **Downstream — seed data is a build-time dependency, not a convenience:** `scripts/seed.ts` must be run — and its sample dataset populated in the Sanity dataset — **before** `frontend/01`, `02`, and `04` begin. Those phases cannot verify their grids, sale badges, or image framing against empty data. The seed set must include at least: one product per category (all four), one product with `salePrice` set (to exercise the sale badge and strikethrough price), one with `inStock: false`, and at least four `featured` products (so the bestsellers grid fills a full row).
- **Downstream — order writes (`frontend/06-checkout-page`):** imports `lib/prisma.ts` (the singleton) and `lib/orders.ts`'s `generateOrderNumber` to build its own order-creation server action. That server action, not this phase, does the actual `prisma.order.create(...)` call, and must retry on a unique-constraint violation (up to 3 times) since `generateOrderNumber` doesn't check uniqueness itself — this phase only provides the schema, the client, and the number-generation helper.
- **Downstream — order lookup (`frontend/07-order-confirmation-page`):** looks up an order via `prisma.order.findUnique({ where: { orderNumber } })` using the same `lib/prisma.ts` singleton — no separate read path is created for this.
- **No interaction with `infra/01`'s owned components** beyond the isolation rule above — this phase touches no `Nav`/`Footer`/`Button`/`ProductImage` code, it only makes `ProductImage` usable with real images via the `next.config` change.

## Architectural Constraints

- **File locations are load-bearing**, same pattern as `infra/01`: `sanity.config.ts`, `sanity/schemaTypes/product.ts`, `lib/sanity/client.ts`, `lib/sanity/queries.ts`, `lib/prisma.ts`, `lib/orders.ts`, `scripts/seed.ts`, `prisma/schema.prisma`, `app/(studio)/studio/[[...tool]]/page.tsx` + its own layout.
- **Server-only is enforced at build time, not just by convention.** `lib/sanity/client.ts` and `lib/sanity/queries.ts` import the `server-only` package at the top of the file, so any accidental import from a client component fails the build instead of silently leaking a token.
- **Prisma singleton pattern:** `lib/prisma.ts` uses the standard `globalThis`-cached pattern (`declare global { var prisma: PrismaClient }`, reuse in development, fresh instance in production) so Next.js dev hot-reload doesn't exhaust Neon's pooled connections.
- **Prisma 7 requires a driver adapter — discovered during implementation, corrected from the original plan.** `new PrismaClient()` with no arguments throws in Prisma 7; there is no adapter-free path for Postgres. `lib/prisma.ts` uses `@prisma/adapter-pg` (`new PrismaPg(databaseUrl)`, the connection-string-argument form, passed to `new PrismaClient({ adapter })`) — the standard Postgres adapter, distinct from the Neon-specific `@prisma/adapter-neon` that stays ruled out.
- **Connection URLs live in `prisma.config.ts`, not `schema.prisma`.** Prisma 7 moved this; `schema.prisma`'s `datasource db` block only declares `provider = "postgresql"`. The pooled/direct split is achieved across two files instead of one: `prisma.config.ts`'s `datasource.url` reads `DIRECT_URL` (used by the CLI for `migrate`/introspection only), while `lib/prisma.ts`'s adapter reads `DATABASE_URL` (pooled, used by the running app) — same intent as the original plan, different mechanism.
- **Standalone scripts/CLI must load `.env.local` themselves — discovered during implementation.** Next's own `dev`/`build`/`start` auto-load `.env.local`, but nothing else does. `prisma.config.ts` and `scripts/seed.ts` both explicitly call dotenv's `config({ path: ".env.local" })` — plain `import "dotenv/config"` only loads `.env` (which this project doesn't have) and silently leaves every var undefined. Any future standalone script needs the same explicit load.
- **Generator output is explicit.** `generator client { provider = "prisma-client"; output = "../lib/generated/prisma" }` — Prisma 7's client generator requires a stated output path; there's no more default generation into `node_modules/.prisma/client`.
- **ISR revalidate window is fixed at 60 seconds** — stated as a concrete number here (not left as a placeholder) so every query helper in `lib/sanity/queries.ts` uses the same value and owners get a predictable "changes appear within a minute" experience.
- **`status` and `paymentMethod` are Prisma-native enums**, not bare strings — `OrderStatus` (`pending | confirmed | shipped | delivered | cancelled`) and `PaymentMethod` (`cod | bank_transfer`), giving type safety at the schema level instead of relying on application-layer validation of free-text values.
- **Money is stored as whole-Rupee integers, not Decimal/Float.** `price`, `salePrice`, `subtotal`, `deliveryCharge`, `total` are all `Int`. The site only ever displays whole-Rupee amounts (`Rs. 1,850`), so integer storage avoids floating-point rounding entirely rather than guarding against it later.
- **Ordered items are a `Json` snapshot field, not a relational `OrderItem` table.** Products live in Sanity, not Postgres, so there's no FK to relate to — modeling items as a related table would imply a relationship that can't actually exist.
- **Migrations only ever run against `DIRECT_URL`.** `prisma/schema.prisma`'s `datasource db` block sets `url = env("DATABASE_URL")` for the app and `directUrl = env("DIRECT_URL")` for `prisma migrate` — Prisma's own mechanism for this split, not a manual env-swap step.
- **Sanity `apiVersion` is pinned to a fixed dated string** (e.g. a specific `YYYY-MM-DD`), documented in `.env.example` — never `"latest"` or left unpinned, so Sanity API changes can't silently break queries.
- **`scripts/seed.ts` is env-guarded, since it is write-capable against real data:**
  - It reads `SANITY_SEED_TOKEN` — a variable separate from anything the running app uses — and exits immediately with a clear error if that var is absent.
  - It refuses to run against the production dataset: it checks the target dataset name and aborts unless it matches the development dataset.
  - It is idempotent: re-running replaces the same sample documents by fixed `_id` values rather than creating duplicates.
- **`.env.example` is exhaustive and annotated.** Every variable this phase introduces (`DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_TOKEN`, `SANITY_SEED_TOKEN`) appears with a placeholder value and a one-line comment on where to obtain it (Sanity project settings vs. Neon dashboard's pooled/direct connection strings) — an env var that exists in code but not in `.env.example` is a silent setup failure for the two non-developer owners and any other developer setting this up from scratch.

## Definition of Done

**Behavioral**
- [x] `/studio` shows the Sanity Studio UI (structure tool, product schema visible) without the storefront's announcement bar/Nav/Footer.
- [x] A product written by `scripts/seed.ts` is fetchable via `lib/sanity/queries.ts` helpers, and its image renders through `next/image` with no remote-pattern error.
- [x] Editing a product in Studio and refetching after the 60s revalidate window shows the updated value (ISR working, no manual cache-bust needed).
- [x] Creating an `Order` row via Prisma and reading it back by `orderNumber` returns the same record.
- [x] Two orders created back-to-back get distinct, non-colliding `orderNumber`s matching the `ZR-YYMMDD-XXXX` format.
- [x] Running `scripts/seed.ts` twice does not create duplicate documents (same fixed `_id`s reused/replaced).
- [x] Running `scripts/seed.ts` with `SANITY_SEED_TOKEN` unset exits immediately with a clear error and writes nothing.
- [x] Running `scripts/seed.ts` against a dataset name that isn't the development dataset aborts without writing.
- [x] The seed set includes: one product per category (all four), at least one with `salePrice` set, at least one with `inStock: false`, and at least four `featured` products.

**Structural** (runnable checks, not eyeballed)
- [x] All files from Domain Ownership exist at their exact paths.
- [x] `server-only` is imported at the top of `lib/sanity/client.ts` and `lib/sanity/queries.ts`. Check: `grep -l "^import \"server-only\"" lib/sanity/*.ts` returns both files.
- [x] `prisma/schema.prisma`'s `datasource db` block has no `url`/`directUrl` (Prisma 7 convention); `prisma.config.ts`'s `datasource.url` reads `DIRECT_URL`; `lib/prisma.ts` constructs a `PrismaPg` adapter over `DATABASE_URL`.
- [x] `OrderStatus` and `PaymentMethod` are declared as Prisma `enum` blocks, not string fields. Check: `grep -c "^enum " prisma/schema.prisma` returns 2.
- [x] `price`, `salePrice`, `subtotal`, `deliveryCharge`, `total` are all `Int` — no `Decimal`/`Float` anywhere in `prisma/schema.prisma`. Check: `grep -c "Decimal\|Float" prisma/schema.prisma` returns 0.
- [x] No `OrderItem` model exists — items are a `Json` field on `Order`. Check: `grep -c "model OrderItem" prisma/schema.prisma` returns 0.
- [x] `orderNumber` has a unique constraint in `prisma/schema.prisma`.
- [x] `next.config.ts`'s `images.remotePatterns` includes the Sanity CDN hostname (`cdn.sanity.io`).
- [x] `.env.example` contains every variable this phase introduces, each with a placeholder and a one-line sourcing comment: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `SANITY_API_TOKEN`, `SANITY_SEED_TOKEN`.
- [x] `.env.local` is not committed. Check: `git ls-files | grep -c "^\.env\.local$"` returns 0.
- [x] `package.json` includes `next-sanity`, `@sanity/image-url`, `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `pg` — and does **not** include `@prisma/adapter-neon` or `@neondatabase/serverless`, and no icon/state library sneaks in here either.

**Testing**
- [x] `npm run build` succeeds — Studio route compiles, Prisma Client generates without error, no TypeScript errors.
- [x] `npx prisma migrate status` (against `DIRECT_URL`) shows the initial migration applied cleanly.
- [x] Running `scripts/seed.ts` completes successfully and populates the sample set described above (verified by querying the dataset afterward).

## Rollback Criteria

Higher-risk than `infra/01` — this phase touches a real external Postgres database (a migration) and a real Sanity dataset (schema + seed content), not just local code. If it needs to be rolled back: `git revert` the branch for the code (schema files, config, scripts), plus `prisma migrate resolve` or manually dropping the `Order` table for the Postgres side — a plain code revert alone does not undo an applied migration. Sanity schema changes are lower-risk to unwind (removing a field from `product.ts` stops Studio from showing it; it doesn't delete existing document data), but seed data written to a real dataset should be cleaned up manually if the dataset is shared.
