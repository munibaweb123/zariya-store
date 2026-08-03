# Phase: frontend/03 — Cart State

**Branch:** `feature/frontend/cart-state`
**Depends on:** infra/01-design-system-setup
**Effort estimate:** M — no page, but a foundational state layer several later phases key off of.

---

## Architectural Role

Provides the single client-side source of truth for cart contents so product-detail, cart-page, and checkout all read and write the same store instead of each inventing their own state.

## Domain Ownership

- Zustand cart store
- localStorage persistence
- `useCart` hook
- `CartProvider`
- Quantity/add/remove/clear logic
- Cart count badge in nav

No page — state layer only.

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import it.
- Do not build any page — state layer only; no `/cart` or `/checkout` UI (`frontend/05`, `06`).
- Do not add "Add to Cart" UI anywhere in this phase — that button lives on `frontend/04`'s product detail page and calls this phase's `useCart().addItem()`.
- Do not touch `Nav.tsx` — the only integration point is `NavCartBadge.tsx`'s internals, per `infra/01`'s documented contract.
- Do not modify `Nav.tsx`, `Footer.tsx`, `Button.tsx`, or any other `infra/01`-owned component beyond `NavCartBadge.tsx`.
- Do not store a raw Sanity image reference in a cart item — `urlForImage()` is `server-only`; cart items store an already-resolved image URL string, which the calling server-rendered page must resolve before its client "Add to Cart" button ever calls `addItem`.
- Do not compute delivery charge or a grand total here — the flat-Rs.250/free-above-Rs.3,000 rule and the total are `frontend/05`/`06`'s presentational concern; this store only exposes `subtotal`.
- Do not add variants/size/volume to the cart item shape — out of v1 scope; `slug` alone is a stable unique key per line.
- Do not add cross-tab sync (`storage` event listeners) — out of scope for v1; drift between open tabs until reload is accepted.
- Do not persist to a database or add an API route — client-only, `localStorage`-persisted, per CLAUDE.md's "Cart state" line.
- Do not add a coupon/discount-code field — confirmed out of v1 scope.
- Do not clamp quantity against a stock count — the product schema only has a boolean `inStock`, no numeric stock; quantity floors at 1 with no stock-driven ceiling.
- Do not add a checkout-time Sanity price-revalidation flow — see the recorded pricing decision in Core Capabilities; `frontend/06` reads cart snapshot prices as-is.

## Core Capabilities

1. **Zustand store** (`lib/cart/store.ts`) holding `items: CartItem[]`, where `CartItem = { slug: string; name: string; image: string; price: number; quantity: number }`. `price` is the *effective* price captured at add-time (salePrice if it was on sale then, else price) — a single snapshot, not a `price`/`salePrice` pair. This matches both the cart-page design reference (one price per line, no strikethrough) and `infra/02`'s `Order.items` JSON snapshot shape, so cart items map onto order items with zero reshaping later.
2. **Actions**: `addItem(item)` (increments quantity if the slug already exists, adds a new line otherwise), `removeItem(slug)`, `updateQuantity(slug, quantity)` (floors at 1 — reducing to 0 is a no-op, since removal is the separate `removeItem` action, matching the design's distinct stepper vs. "Remove" link), `clearCart()` (used once by `frontend/07` after an order is placed).
3. **Derived values** via `useCart()`: `items`, `totalItems` (sum of quantities, feeds the nav badge), `subtotal` (sum of `price * quantity`). No delivery/grand-total math here.
4. **Price snapshots are final at checkout — not revalidated against Sanity.** *Decision, load-bearing for `frontend/06`:* once a price is captured into a cart line at add-to-cart time, it does not change even if the owner edits that product's price in Sanity afterward, and `frontend/06`'s checkout does not re-fetch Sanity to compare or update it — the order is built directly from the cart's snapshot values, and the customer pays what they saw. This keeps checkout free of a live Sanity dependency and matches `infra/02`'s `Order.items` snapshot design (items are already meant to be frozen at order time, independent of Sanity). The project's existing WhatsApp confirmation step is the real safety net for meaningful price drift — the owner sees every order before shipping and can catch it manually, the same manual review every order already goes through. `frontend/06` must not add a "price changed" revalidation/banner flow; it simply reads `subtotal`/`items` as-is.
5. **localStorage persistence** via Zustand's `persist` middleware, key `"zariya-cart-v1"` (namespaced and versioned, not a generic `"cart"`), so a future incompatible shape change can bump to `-v2` and be treated as absent rather than misread. Corrupt, hand-edited, or outdated-schema data is validated on read and falls back to a fresh empty cart rather than throwing — see Architectural Constraints.
6. **`CartProvider`** — a thin `'use client'` component mounted once around `{children}` in `app/(storefront)/layout.tsx` (the one edit this phase makes there). It's not injecting a React Context (Zustand's store is already a plain hook); its job is running the one-time `localStorage` rehydration on mount and exposing a `hasHydrated` flag so cart-dependent UI avoids an SSR/client mismatch.
7. **`NavCartBadge`** (editing only this file's internals, per `infra/01`'s contract): calls `useCart()` internally for `totalItems`, showing the count bubble only once `hasHydrated` is true — before that it renders as the server did (no bubble). The `count` prop is removed entirely since `Nav.tsx` already renders `<NavCartBadge />` with no props and needs zero changes.

## Service Interactions

- **Upstream:** `infra/01` only — `app/(storefront)/layout.tsx` (wrapping `{children}` in `CartProvider`) and `components/layout/NavCartBadge.tsx` (internals only; `Nav.tsx` untouched).
- **Downstream:** `frontend/04` calls `addItem` from its own button after resolving the image URL server-side; `frontend/05` reads `items`/`subtotal`, calls `updateQuantity`/`removeItem`; `frontend/06` reads `items`/`subtotal` as-is (no price revalidation, per the recorded decision) to build the order snapshot and apply the delivery rule; `frontend/07` calls `clearCart()` once an order is confirmed placed.
- No interaction with Sanity or Prisma — this phase touches neither `lib/sanity/*` nor `lib/prisma.ts`.

## Architectural Constraints

- **File locations:** `lib/cart/store.ts`, `lib/cart/useCart.ts`, `components/cart/CartProvider.tsx`.
- **Exactly two `'use client'` files in this phase:** `CartProvider.tsx` (new) and `NavCartBadge.tsx` (already `'use client'` from `infra/01`, directive unchanged).
- **Hydration mismatch is a real, known risk here, not hypothetical.** `persist` reads `localStorage`, which doesn't exist during SSR — the server always renders an empty cart. Use `persist`'s `skipHydration: true` plus a manual `rehydrate()` inside `CartProvider`'s `useEffect`, gated behind a `hasHydrated` flag the store also exposes; `NavCartBadge` must check that flag before trusting `totalItems`.
- **Persisted key is namespaced and versioned: `"zariya-cart-v1"`** — not a generic `"cart"` — so a future incompatible shape change bumps to `-v2` and is treated as absent rather than misread.
- **Corrupt/outdated localStorage never throws.** The persisted state carries its own `version` (Zustand persist's `version` option) and is validated on read — e.g. `Array.isArray(items)` and every item has the expected keys — before being trusted; a hand-edited value, a JSON parse failure, or a version mismatch all fall back to a fresh empty cart rather than propagating an error into the React tree.
- **`CartItem.price` is a single number**, mirroring `infra/02`'s `Order.items` snapshot shape exactly — no reshaping needed when `frontend/06` builds the order payload, and no Sanity re-fetch at checkout (see the recorded pricing decision above).
- **No new dependency beyond `zustand`** — already named as this phase's library back in `infra/01`'s Anti-Patterns.
- **`updateQuantity` floors at 1**, no stock-driven ceiling (no numeric stock field exists).
- **No delivery-charge or grand-total math in `lib/cart/`** — `subtotal` is the only money value this phase produces.

## Definition of Done

**Behavioral**
- [x] `addItem` creates a new line; adding the same slug again increments quantity instead of duplicating.
- [x] `updateQuantity(slug, n)` clamps to a minimum of 1 — 0 or negative leaves quantity at 1, does not remove the item.
- [x] `removeItem(slug)` removes exactly that line, no others.
- [x] `clearCart()` empties all items.
- [x] `totalItems` = sum of quantities; `subtotal` = sum of `price * quantity`.
- [x] Cart survives a full page reload with no hydration-mismatch console warning.
- [x] `NavCartBadge` shows no bubble on first paint, correct count immediately after hydration — no visible flash of a wrong number.
- [x] `Nav.tsx` has zero diff from its `infra/01` state.
- [x] `app/(storefront)/layout.tsx`'s only change is `CartProvider` wrapping `{children}`.
- [x] Cart line items store a price snapshot taken at add-to-cart time, and `subtotal` is computed from that snapshot, not from a live Sanity price — if the owner changes a product's price in Sanity while it sits in someone's cart, the cart amount does not silently change.
- [x] **Recorded decision for `frontend/06`:** a stale snapshot price is accepted as-is at checkout — the customer pays what they saw, and the order is built directly from cart snapshot values with no Sanity revalidation. The existing WhatsApp confirmation step (every order is already manually reviewed by the owner before fulfillment) is the safety net for meaningful price drift, not a checkout-time revalidation flow.
- [x] Corrupt or outdated localStorage data does not break the app — a hand-edited value, invalid JSON, or a stored shape from an earlier schema version resets the cart to empty rather than throwing.

**Structural**
- [x] `lib/cart/store.ts`, `lib/cart/useCart.ts`, `components/cart/CartProvider.tsx` exist at those paths.
- [x] Exactly `CartProvider.tsx` and `NavCartBadge.tsx` carry `'use client'` among this phase's touched files.
- [x] `package.json` gains exactly one new dependency: `zustand`.
- [x] No Sanity or Prisma import under `lib/cart/` or `components/cart/`.
- [x] Zero hardcoded hex values, zero arbitrary-value classes in any file this phase touches.
- [x] The persisted localStorage key is namespaced and versioned (`zariya-cart-v1`), not a generic name like `"cart"`. Check: grep the store file for the key literal.

**Testing**
- [x] `npm run build` and `npm run lint` pass.
- [x] Manual check: add several products, reload, confirm persisted state and correct badge count with no console errors.
- [x] Manual check: a second tab doesn't crash even without live cross-tab sync.
- [x] Manual check: manually corrupt the `zariya-cart-v1` localStorage entry (invalid JSON, or valid JSON with a wrong shape) and reload — the app loads normally with an empty cart, no thrown error.

## Rollback Criteria

Low-risk — no data writes, nothing persisted beyond the customer's own browser. `git revert` is sufficient, except once `frontend/04`–`07` depend on `useCart()` — check those imports before reverting at that point.
