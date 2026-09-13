# Phase: frontend/04 — Product Detail Page

**Branch:** `feature/frontend/product-detail-page`
**Depends on:** infra/01-design-system-setup, infra/02-data-layer-setup, frontend/01-home-page (`ProductCard` for related products), frontend/03-cart-state (add-to-cart)
**Effort estimate:** L — owns three shared components plus the shared WhatsApp helper.
**Visual reference:** `stitch/zariya_product_page/screen.png`

---

## Architectural Role

Completes the discovery flow and is the entry point into the order flow (add to cart / order on WhatsApp). Also the sole owner of the WhatsApp link-building logic reused by order-confirmation.

## Domain Ownership

- `/product/[slug]` route
- **OWNS:** `QuantityStepper`, `Accordion`, `ImageGallery`
- **OWNS:** `lib/whatsapp.ts` — shared `wa.me` link builder, used here for "Order on WhatsApp" and reused by `frontend/07-order-confirmation-page` for "Confirm on WhatsApp"
- Image gallery with thumbnails, price with sale handling, short description, add to cart, accordion sections, related products

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import `ProductImage`/`Button` (`infra/01`), `ProductCard`/`formatPrice` (`frontend/01`), `useCart` (`frontend/03`).
- Do not add color/size/variant selectors — confirmed out of v1 scope; the schema has no such field.
- Do not compute or display a discount percentage — same rule `frontend/01` established for `ProductCard`, kept consistent here.
- Do not add a subcategory to the breadcrumb — no such field exists; breadcrumb is "Home / `<Category Label>`" only, category label derived by capitalizing the `Category` string, not a new lookup table.
- Do not modify `Footer.tsx` or its `WHATSAPP_SUPPORT_URL` constant — that's `infra/01`-owned; this phase's `lib/whatsapp.ts` defines its own store phone number independently, even though `Footer.tsx`'s existing comment anticipates this file.
- Do not add a wishlist/heart icon to related-product cards — confirmed out of v1 scope; reuse `ProductCard` exactly as `frontend/01` built it.
- Do not build `Accordion` as a client-side toggle component — use native `<details>/<summary>`, CSS-only chevron rotation, zero JavaScript.
- Do not add cart-count logic or touch `NavCartBadge`/`Nav.tsx` — that seam is closed by `frontend/03`.
- Do not query Sanity from a client component — `ImageGallery` and `PurchaseActions` receive fully-resolved data as props; the page does all fetching.
- Do not add a "materials and care" or "shipping and returns" field to the Sanity schema — that copy is static, identical across every product, same placeholder pattern as `frontend/02`'s `CATEGORY_META`.
- Do not add a numeric stock-count or low-stock warning — the schema only has boolean `inStock`.

## Core Capabilities

1. **`/product/[slug]` route** — fetches via `getProductBySlug` (existing, unused-until-now `infra/02` export); an unknown slug calls `notFound()`.
2. **Breadcrumb** — "Home / `<Category Label>`", label derived by capitalizing the product's `category` string.
3. **`ImageGallery`** (`components/ui/ImageGallery.tsx`, the phase's first `'use client'` leaf) — main image + thumbnail strip; clicking a thumbnail swaps the main image (local `useState`, no cart/Sanity involvement). Zero images renders a plain `bg-blush` frame, matching the empty-image pattern already used by `CategoryTile`/`ProductCard`.
4. **Price display** — name (serif headline), effective price in maroon, strikethrough original price + `SALE` badge only when `salePrice` exists and is lower than `price` (identical rule to `ProductCard`, no percentage).
5. **Description** — renders `product.description`; falls back to a generic line ("No description available for this product yet.") when `null`, rather than an empty accordion panel.
6. **`QuantityStepper`** (`components/ui/QuantityStepper.tsx`, reusable) — controlled `{ quantity, onChange, min? }`, floors at 1, no stock-driven ceiling (no numeric stock field). Owned here but written generically enough that `frontend/05`'s cart-line quantity edits can reuse it later.
7. **`PurchaseActions`** (`components/product/PurchaseActions.tsx`, page-specific composition, the phase's second `'use client'` leaf) — holds local quantity state via `QuantityStepper`; "Add to Cart" calls `useCart().addItem()` with the resolved slug/name/image/effective-price/quantity; "Order on WhatsApp" opens `buildWhatsAppLink(...)` with a message built from the product name, quantity, and effective price (no product URL — the domain isn't finalized yet, per CLAUDE.md's Resolved Decisions). Both actions read the *same* local quantity value, so ordering 3 via either path is consistent.
8. **Out-of-stock state** — when `inStock` is `false`: both actions render disabled with a clear "Out of Stock" label instead of "Add to Cart", the quantity stepper is hidden, and "Order on WhatsApp" is not offered. First real consumer of the schema's `inStock` field, unused everywhere else so far.
9. **`Accordion`** (`components/ui/Accordion.tsx`, reusable, zero JS) — native `<details>`/`<summary>` per section (Description open by default, matching the design reference); chevron rotation via Tailwind's `open:`/`group-open:` modifiers, no client component needed.
10. **Related products** ("You may also like") — `listProductsByCategory(product.category)` (existing, unused-until-now `infra/02` export), excluding the current product by slug, capped at 4, rendered via imported `ProductCard`. No wishlist icon, no `highlightNew` (not a "newest" listing).
11. **`lib/whatsapp.ts`** — `buildWhatsAppLink(message: string): string`, store phone number as a private module constant (same placeholder pattern as `Footer.tsx`'s independent constant). `frontend/07` will reuse this exact function for "Confirm on WhatsApp" without this phase anticipating its message format.

## Service Interactions

- **Upstream:** `infra/01` (`Button`, `ProductImage`, tokens), `infra/02` (`getProductBySlug`, `listProductsByCategory` — both existing, first real consumers), `frontend/01` (`ProductCard`, `formatPrice`), `frontend/03` (`useCart().addItem`).
- **Downstream:** `frontend/05` may reuse `QuantityStepper` for cart-line quantity edits. `frontend/07` reuses `lib/whatsapp.ts`'s `buildWhatsAppLink` for "Confirm on WhatsApp" with its own message content — this phase does not shape that message format in advance.
- **Query load:** two Sanity fetches per render (`getProductBySlug`, `listProductsByCategory`), both server-side in `page.tsx` only.
- **No interaction with Prisma** — this phase touches no order/checkout code.

## Architectural Constraints

- **File locations:** `app/(storefront)/product/[slug]/page.tsx`, `components/ui/QuantityStepper.tsx`, `components/ui/Accordion.tsx`, `components/ui/ImageGallery.tsx` (shared primitives, parallel to `frontend/01`'s `ProductCard`/`SectionHeading`), `components/product/PurchaseActions.tsx` (page-specific, parallel to `frontend/01`'s `components/home/`), `lib/whatsapp.ts`.
- **Exactly two `'use client'` files in this phase:** `ImageGallery.tsx` and `PurchaseActions.tsx`. `Accordion.tsx` is a Server Component (native `<details>`); the page itself is a Server Component.
- **No new `lib/sanity/queries.ts` export** — `getProductBySlug` and `listProductsByCategory` already exist from `infra/02` and are simply called for the first time; this phase adds nothing to that file.
- **Effective price is computed once, consistently** — `salePrice != null && salePrice < price ? salePrice : price`, the same rule as `ProductCard`, reused for both the displayed price and the WhatsApp message and the cart-add call — never recomputed differently in three places.
- **No new dependency** — no carousel/lightbox library for `ImageGallery`, no accordion package, no URL-encoding library beyond the built-in `encodeURIComponent`.
- **`lib/whatsapp.ts` has no `server-only` marker** — unlike `urlForImage`, it's a pure string-formatting function with no secrets or server-only APIs, so it's safe to call from the client `PurchaseActions` component directly.

## Definition of Done

**Behavioral**
- [x] An existing product slug renders name, effective price, description (or the fallback line), image gallery, and related products from its category.
- [x] An unknown slug returns a real 404.
- [x] Breadcrumb reads "Home / `<Category Label>`" with the category correctly capitalized.
- [x] `SALE` badge and strikethrough price render only when `salePrice` exists and is lower than `price` — never a discount percentage.
- [x] Clicking a thumbnail in `ImageGallery` swaps the main image; a product with zero images shows a plain blush frame, no broken image.
- [x] `QuantityStepper` floors at 1; increasing/decreasing updates the value used by both "Add to Cart" and "Order on WhatsApp".
- [x] "Add to Cart" calls `useCart().addItem()` with the correct slug/name/resolved image URL/effective price/quantity — confirmed by cart state (e.g. via the nav badge count) actually changing.
- [x] The price snapshot passed to `addItem()` is the effective price at the moment of adding — matching the snapshot contract established in `frontend/03-cart-state`, so the cart total never silently changes if the owner edits a price in Sanity afterwards.
- [x] "Order on WhatsApp" opens a `wa.me` link containing the product name, the current quantity, and the effective price, URL-encoded correctly.
- [x] When `inStock` is `false`: no quantity stepper, both actions replaced by a disabled "Out of Stock" state — neither `addItem` nor a WhatsApp link is reachable.
- [x] `Accordion` shows Description expanded by default; Materials & Care and Shipping & Returns are collapsed, static, identical across every product.
- [x] Related products show up to 4 items from the same category, excluding the current product, using the unmodified `ProductCard` (no wishlist icon).

**Structural**
- [x] All five files exist at their exact paths.
- [x] Exactly `ImageGallery.tsx` and `PurchaseActions.tsx` carry `'use client'` among this phase's touched files; `Accordion.tsx` does not.
- [x] `package.json` has no diff.
- [x] `lib/sanity/queries.ts` has no diff — this phase adds no new export there.
- [x] Zero hardcoded hex values, zero arbitrary-value classes in this phase's files, checked via grep, same standard as `infra/01`.
- [x] `Footer.tsx` has no diff from `develop`.

**Testing**
- [x] `npm run build` and `npm run lint` both pass.
- [x] Manual check against the live seeded dataset: an on-sale product shows the badge/strikethrough correctly; an out-of-stock product (seed includes one, per `infra/02`) shows the disabled state.
- [x] Manual check: a product with multiple images has working thumbnail switching.
- [x] The accordion expands and collapses with JavaScript disabled, using native `<details>`/`<summary>` — confirmable by reading the rendered markup, not only by running JS.

## Rollback Criteria

Low-risk — no data writes, no schema changes, no new dependency. `git revert` of the branch is sufficient. Check whether `frontend/07` has started importing `lib/whatsapp.ts`'s `buildWhatsAppLink` before reverting once that phase exists.
