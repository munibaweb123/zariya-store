# Phase: frontend/05 — Cart Page

**Branch:** `feature/frontend/cart-page`
**Depends on:** frontend/03-cart-state, frontend/04-product-detail-page (imports `QuantityStepper` — does not rebuild it)
**Effort estimate:** S
**Visual reference:** `stitch/zariya_cart_page/screen.png`

---

## Architectural Role

A visual and editing surface over the `cart-state` store; holds no cart logic of its own.

## Domain Ownership

- `/cart` route
- Line items (using imported `QuantityStepper`), remove links, order summary card, empty state
- Does **not** own or redefine `QuantityStepper`

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import `QuantityStepper` (`frontend/04`), `ProductImage`/`Button` (`infra/01`), `formatPrice` (`frontend/01`), `useCart` (`frontend/03`).
- Do not add cart logic (add/remove/update mechanics) — this page only calls `frontend/03`'s existing `updateQuantity`/`removeItem`; no new cart business rules live here.
- Do not build `/checkout` — `frontend/06`'s job; "Proceed to Checkout" links there and 404s until it lands, same dangling-route pattern as elsewhere.
- Do not fetch from Sanity or revalidate prices — cart items are fully self-contained snapshots per `frontend/03`'s recorded stale-price decision; this page only ever reads what's already in the store.
- Do not add a coupon/promo-code field — confirmed out of v1 scope.
- Do not recompute delivery charge ad hoc in this page — use the new shared `lib/delivery.ts`, since `frontend/06` must apply the identical threshold.
- Do not add a `SALE` badge or strikethrough price to cart lines — cart items only ever carry one snapshot price (`frontend/03`'s decision); there's nothing to strike through.
- Do not add cross-tab sync or any change to `lib/cart/store.ts` — that file is closed, owned by `frontend/03`.

## Core Capabilities

1. **`/cart` route** (`app/(storefront)/cart/page.tsx`) — the entire page is `'use client'` (the one exception to server-first in this phase, matching CLAUDE.md's own list of expected client leaves); there is no server data to fetch. Verified, not assumed: the item count in "Your cart (N items)", the empty/populated branch, and every order-summary number all depend on live cart state — the only static text (button labels, the "Cash on Delivery available nationwide" note) is a handful of trivial strings. Splitting into a Server Component shell around a Client Component would move none of `ProductImage`/`QuantityStepper`/`Button`/the cart-reading logic out of the client bundle, so it would add a file for no measurable benefit — a premature abstraction, not a real optimization.
2. **Hydration-gated rendering** — before `useCart().hasHydrated` is `true`, the page renders the same "empty cart" view the server saw, exactly mirroring `NavCartBadge`'s approach from `frontend/03`. This avoids a hydration mismatch; the tradeoff is a brief empty-state flash on reload for a non-empty cart, which is accepted, not treated as a bug.
3. **Empty state** — when hydrated and `items.length === 0`: a centered "Your cart is empty" message and a `Button` back to `/`. No order summary card, no line items.
4. **`CartLineItem`** (`components/cart/CartLineItem.tsx`, page-specific, no `'use client'` of its own — its only consumer is the already-client page, same rule established for `QuantityStepper` in `frontend/04`) — renders the item's image via `ProductImage`, name, `QuantityStepper` (imported unchanged from `frontend/04`, wired to `updateQuantity(slug, next)`), a "Remove" link (wired to `removeItem(slug)`), and the line total (`formatPrice(price * quantity)` — a line *total*, not unit price, so adjusting quantity visibly changes the number next to it).
5. **Order summary card** (inlined in `page.tsx` — small enough not to warrant its own file at this phase's effort level; a future phase can extract one if `frontend/06` turns out to need something identical) — Subtotal (`useCart().subtotal`), Delivery (via `lib/delivery.ts`, shows "Free" when the charge is 0), Total (subtotal + delivery), "Proceed to Checkout" (`Button` → `/checkout`), "Continue shopping" (`Button variant="secondary"` → `/`).
6. **`lib/delivery.ts`** — `FREE_DELIVERY_THRESHOLD = 3000`, `FLAT_DELIVERY_CHARGE = 250`, `calculateDeliveryCharge(subtotal: number): number` (returns `0` when `subtotal >= FREE_DELIVERY_THRESHOLD`, else `FLAT_DELIVERY_CHARGE`). The one new shared module this phase owns; `frontend/06` imports it rather than reimplementing the threshold.

## Service Interactions

- **Upstream:** `frontend/03` (`useCart` — `items`, `subtotal`, `hasHydrated`, `updateQuantity`, `removeItem`), `frontend/04` (`QuantityStepper`, imported unchanged), `infra/01` (`ProductImage`, `Button`, tokens), `frontend/01` (`formatPrice`).
- **Downstream:** `frontend/06` imports `lib/delivery.ts`'s `calculateDeliveryCharge` for its own order summary and reads `useCart().items`/`subtotal` to build the order payload.
- **No Sanity or Prisma interaction** — this phase touches neither.

## Architectural Constraints

- **File locations:** `app/(storefront)/cart/page.tsx`, `components/cart/CartLineItem.tsx`, `lib/delivery.ts`.
- **Exactly one `'use client'` file in this phase: `page.tsx` itself.** `CartLineItem.tsx` needs no directive of its own (same reasoning as `QuantityStepper`).
- **`lib/delivery.ts` has no dependency on cart state** — it's a pure function of a number (`subtotal`), decoupled from `lib/cart/` so `frontend/06` can call it with a checkout-computed subtotal too, not only the cart store's.
- **No new dependency.**
- **Grid/list layout follows the design reference's two-column desktop split** (line items + sticky order summary), stacking to one column on mobile — no new breakpoint invented beyond the project's established rule.

## Definition of Done

**Behavioral**
- [x] Empty cart (post-hydration) shows "Your cart is empty" and a link back to `/`, no order summary card.
- [x] Non-empty cart shows one `CartLineItem` per line: image, name, quantity stepper, "Remove" link, line total (`price * quantity`).
- [x] Changing quantity via the stepper updates that line's total and the order summary's Subtotal/Total immediately (reactive from the shared store).
- [x] "Remove" removes exactly that line; if it was the last line, the page switches to the empty state.
- [x] Delivery shows "Free" when subtotal ≥ Rs. 3,000, else Rs. 250 — verified at, just under, and just over the threshold.
- [x] Total = Subtotal + Delivery, always.
- [x] "Proceed to Checkout" links to `/checkout`; "Continue shopping" links to `/`.
- [x] No hydration-mismatch console warning on load, verified the same way as `frontend/03` (`jsdom` + `renderToString`/`hydrateRoot`, given no real browser is available in this sandbox).
- [x] The whole page is not a client component just because the cart is client state. Verify the structural claim is actually true — if `page.tsx` carries `'use client'`, confirm that is a deliberate decision recorded in Architectural Constraints, and that nothing static (headings, the summary card shell) is needlessly pulled into the client bundle. If a server page with a client child is feasible, prefer it.
- [x] `QuantityStepper` is imported from `frontend/04`, not redefined here — it is listed in the ownership map as that phase's component.

**Structural**
- [x] `app/(storefront)/cart/page.tsx`, `components/cart/CartLineItem.tsx`, `lib/delivery.ts` exist at those paths.
- [x] Exactly `page.tsx` carries `'use client'` among this phase's files.
- [x] `package.json` has no diff.
- [x] `lib/cart/store.ts` and `lib/sanity/queries.ts` both have no diff.
- [x] `components/ui/QuantityStepper.tsx` has no diff — this phase imports it unchanged.
- [x] Zero hardcoded hex values, zero arbitrary-value classes.

**Testing**
- [x] `npm run build` and `npm run lint` both pass.
- [x] Manual check: add several products via the product-detail page, visit `/cart`, confirm quantities/totals/removal all behave correctly and match `localStorage`.

## Rollback Criteria

Low-risk — no data writes, no schema changes. `git revert` of the branch is sufficient. Check whether `frontend/06` has started importing `lib/delivery.ts` before reverting once that phase exists.
