# Phase: frontend/07 — Order Confirmation Page

**Branch:** `feature/frontend/order-confirmation-page`
**Depends on:** infra/02-data-layer-setup, frontend/06-checkout-page (order data/order number), frontend/04-product-detail-page (imports `lib/whatsapp.ts` — does not rebuild it)
**Effort estimate:** S
**Visual reference:** `stitch/zariya_confirmation_page/screen.png`

---

## Architectural Role

Closes the order-flow loop, confirming success and handing the customer to WhatsApp using the shared link builder from `frontend/04-product-detail-page`.

## Domain Ownership

- `/order/[orderNumber]` route
- Success state, order number, summary, delivery estimate, "Confirm on WhatsApp" button (imports `lib/whatsapp.ts` from `frontend/04-product-detail-page` — does not redefine it)

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import `Button` (`infra/01`), `formatPrice` (`frontend/01`), `buildWhatsAppLink` (`frontend/04`).
- Do not modify `lib/whatsapp.ts`, `lib/orders.ts`, `lib/prisma.ts`, or `prisma/schema.prisma` — all consumed as-is.
- Do not add a product-image thumbnail to order summary line items — `OrderItemSnapshot` only stores `slug`/`name`/`price`/`quantity`, no image. Render text-only line items matching what's actually persisted, not what the design mockup shows.
- Do not add postal code/country fields to the delivery address — the `Order` model has no such fields; only `customerName`/`address`/`city`/`province`/`landmark` render.
- Do not add order-status-aware messaging (e.g. "shipped"/"delivered" variants) — always the same static success confirmation regardless of the order's current `status`; status display is out of scope here.
- Do not clear the cart before hydration completes — see Architectural Constraints for the race this avoids.
- Do not add authentication/access-control to this route — a guest confirmation page reachable by order number is the standard, accepted pattern for a no-accounts site, per CLAUDE.md's Out of Scope list. See Architectural Constraints for the recorded exposure decision.
- Do not recompute `subtotal`/`deliveryCharge`/`total` — read directly from the fetched `Order` row, already validated at checkout time (unlike `frontend/06`, which had to guard against client tampering).
- Do not display the customer's phone number on this page — the design reference doesn't show it, and it's unnecessary exposure behind a guessable URL beyond what's already accepted below.
- Do not treat the order number as a single-use/consumable view token — this route is a plain idempotent lookup by `orderNumber`; do not mark orders "viewed" or invalidate the URL after first load.

## Core Capabilities

1. **`/order/[orderNumber]` route** (Server Component) — fetches via `prisma.order.findUnique({ where: { orderNumber } })`; not found calls `notFound()`. A plain, repeatable lookup — revisiting the same URL (from a bookmark, a different device, or the owner checking an order) always re-renders the same order from Postgres, with nothing dependent on cart state, referrer, or session history.
2. **Success state** — checkmark icon, "Shukriya! Order placed", "Order #`<orderNumber>` · We will confirm your order on WhatsApp within a few minutes."
3. **Order summary card** — line items (name, quantity, price — no image), Delivery Address (`customerName`/`address`/`city`/`province`, `landmark` shown only when present), Payment Method (label mapped from the `cod`/`bank_transfer` enum), Subtotal/Delivery/Total read directly from the stored row.
4. **"Confirm on WhatsApp"** — `Button` wrapping `buildWhatsAppLink(message)`, message built server-side from the order's items/total/order number/address; `lib/whatsapp.ts` imported unchanged.
5. **"Continue Shopping"** → `/`.
6. **Expected delivery note** — static text ("Expected delivery: 3–5 working days nationwide via courier"), no per-order estimate logic.
7. **`ClearCartOnConfirmation`** (`components/order/ClearCartOnConfirmation.tsx`, this phase's only `'use client'` file) — mounted once by the page, renders nothing; waits for `useCart().hasHydrated` before calling `clearCart()`, avoiding the rehydration race described below. Idempotent by construction: a second visit (cart already empty) is a harmless no-op, not an error.

## Service Interactions

- **Upstream:** `infra/02` (`prisma`, the `Order` model), `frontend/01` (`formatPrice`), `frontend/03` (`useCart` — only inside `ClearCartOnConfirmation`), `frontend/04` (`buildWhatsAppLink`), `infra/01` (`Button`, tokens).
- **Downstream:** none — last page in the order flow.
- **No Sanity interaction.**

## Architectural Constraints

- **File locations:** `app/(storefront)/order/[orderNumber]/page.tsx`, `components/order/ClearCartOnConfirmation.tsx`.
- **Exactly one `'use client'` file: `ClearCartOnConfirmation.tsx`.** The page itself is a Server Component — contrast with `frontend/05`/`06`, whose primary content came from client-only cart state; this page's primary content comes from Postgres, so that reasoning doesn't apply here.
- **The hydration race is real, not hypothetical, and must be guarded against explicitly.** `CartProvider`'s `rehydrate()` effect reads the pre-order cart back from `localStorage` on mount. If `ClearCartOnConfirmation` calls `clearCart()` unconditionally on its own mount, `rehydrate()` can finish *after* that clear and silently repopulate the cart with the old (pre-order) contents — undoing it. `ClearCartOnConfirmation` must gate on `hasHydrated` being `true` before calling `clearCart()`.
- **Recorded decision: the current exposure behind a guessable URL is an accepted v1 tradeoff, not an oversight.** `orderNumber` is `ZR-YYMMDD-XXXX` with a 4-character suffix from a 32-character alphabet — 1,048,576 combinations per day. This page exposes order number, items, total, and delivery address (name + address + city + province) to anyone with the URL — no payment details, no CNIC, and this phase deliberately omits the phone number. This matches the standard guest-checkout confirmation pattern (e.g. Shopify's own order-status pages), and is judged acceptable for a small boutique with no accounts and no realistic scraping-target profile at this scale. If that judgment ever changes, the correct mitigation is widening `CODE_LENGTH` in `lib/orders.ts` (e.g. to 6–8 characters), **not adding authentication** — but that constant is `infra/02`-owned and out of this phase's scope to change; it's flagged here for a future phase to revisit, not acted on now.
- **No new `lib/sanity/queries.ts`, `lib/cart/store.ts`, `lib/orders.ts`, `lib/whatsapp.ts`, or `prisma/schema.prisma` changes** — all read-only/consumed as-is.

## Definition of Done

**Behavioral**
- [x] Visiting `/order/<real orderNumber>` shows the success state, correct order number, item list (name/qty/price, no image), delivery address, payment method label, and Subtotal/Delivery/Total matching the stored `Order` row exactly.
- [x] An unknown/invalid `orderNumber` returns a real 404.
- [x] "Confirm on WhatsApp" opens a `wa.me` link containing the order number, an item summary, and the total, URL-encoded correctly.
- [x] "Continue Shopping" links to `/`.
- [x] Visiting the confirmation page clears the cart — verified by placing an order with items in the cart, then confirming the cart is empty afterward.
- [x] The cart-clear does not race hydration: simulating a cold `localStorage` read with a pre-existing cart, the cart still ends up empty with no old items reappearing — verified directly (a naive "clear on mount" would let `rehydrate()` silently restore the old cart over the clear).
- [x] Payment method displays "Cash on Delivery" or "Bank Transfer / JazzCash / Easypaisa" matching the stored enum value.
- [x] Optional `landmark`, when present, is shown; when absent, no empty line renders.
- [x] The page renders correctly on a direct visit with no prior session — someone opening the URL from a WhatsApp message on a different device, or the owner opening it to check an order. Nothing on the page depends on cart state, referrer, or having just completed checkout.
- [x] Revisiting the same confirmation URL later still renders the order (a lookup by `orderNumber`, not a one-time view), and the cart-clear on a second visit is a no-op rather than an error.

**Structural**
- [x] Both files exist at their exact paths.
- [x] Exactly `ClearCartOnConfirmation.tsx` carries `'use client'`; the page itself does not.
- [x] `package.json` has no diff.
- [x] `lib/whatsapp.ts`, `lib/orders.ts`, `lib/prisma.ts`, `prisma/schema.prisma`, `lib/cart/store.ts` all have no diff.
- [x] Zero hardcoded hex values, zero arbitrary-value classes.
- [x] The page does not display anything that should stay private beyond what's recorded as accepted in Architectural Constraints (order number, items, total, delivery address) — specifically, no phone number rendered anywhere on this page.

**Testing**
- [x] `npm run build` and `npm run lint` both pass.
- [x] A real order is created (same direct-test technique as `frontend/06`), the confirmation page's data is verified against it, and the order is deleted afterward.
- [x] The hydration-race guard is verified with a real scenario simulating a fresh load with a pre-existing `localStorage` cart, confirming the cart ends up empty, not repopulated.

## Rollback Criteria

Low-risk — no schema changes, no new writes (reads `Order` rows, clears client-side cart state only). `git revert` is sufficient; this is the last phase in the order flow, so nothing downstream depends on it.
