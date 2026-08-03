# Phase: frontend/06 — Checkout Page

**Branch:** `feature/frontend/checkout-page`
**Depends on:** infra/02-data-layer-setup (`Order` model), frontend/03-cart-state (order summary/contents), frontend/05-cart-page (flow continuity)
**Effort estimate:** L — guest form plus server action plus Postgres write.
**Visual reference:** `stitch/zariya_checkout_page/screen.png`

---

## Architectural Role

The conversion point of the whole site — where `cart-state` and the Postgres `Order` table meet. The only phase that writes an `Order`.

## Domain Ownership

- `/checkout` route
- Guest contact fields (name, phone), delivery address (address, city, province, optional landmark), payment method selector (COD default, bank transfer secondary), order notes, sticky order summary
- The order-creation server action: validates input, writes `Order` to Postgres, generates the order number

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import `Button`/`ProductImage` (`infra/01`), `formatPrice` (`frontend/01`), `useCart` (`frontend/03`), `calculateDeliveryCharge` (`frontend/05`).
- Do not modify `prisma/schema.prisma`, `lib/prisma.ts`, `lib/orders.ts`, `lib/delivery.ts`, or `lib/cart/store.ts` — all consumed as-is.
- Do not add a Province select field to the form — province is derived server-side from the selected city via `lib/checkout/cities.ts`; it structurally can't arrive from client input since the Zod schema for form fields has no province key at all.
- Do not add the "Same as phone number for WhatsApp updates" checkbox from the design reference — no separate WhatsApp-number field exists on the `Order` model, and this phase adds no columns.
- Do not clear the cart on successful order creation — that's `frontend/07`'s job, per `frontend/03`'s already-documented ownership boundary.
- Do not build `/order/[orderNumber]` — `frontend/07`'s job; the success-redirect target 404s until that phase lands, same dangling-route pattern as elsewhere.
- Do not trust client-supplied `subtotal`/`deliveryCharge`/`total` figures — the server action recomputes all three from the submitted items' `price`/`quantity` and `lib/delivery.ts`. It does not re-derive or revalidate the per-item *prices* themselves (already settled by `frontend/03`'s stale-price decision) — only the arithmetic sums.
- Do not add an online payment gateway — COD/bank transfer only, per CLAUDE.md's Out of Scope list.
- Do not decrement stock or write to Sanity in any way — this phase only writes to Postgres.

## Core Capabilities

1. **`/checkout` route** (`app/(storefront)/checkout/page.tsx`) — the entire page is `'use client'`, same reasoning as `frontend/05`'s cart page: the order summary depends entirely on live cart state, hydration-gated the same way (renders the empty view until `hasHydrated`).
2. **Empty-cart guard** — hydrated + empty cart shows the same "cart is empty" message pattern as `frontend/05`; no form, no summary.
3. **Contact Information** — Full Name, Phone Number (fixed "+92" prefix + a 10-digit national-number input).
4. **Delivery Address** — Complete Address (free text), City (single dropdown sourced from `lib/checkout/cities.ts`, no Province select), Landmark (optional).
5. **Payment Method** — radio selection: Cash on Delivery (default) / Bank Transfer (maps to the existing `bank_transfer` enum value, combining the design reference's "Bank Transfer / JazzCash / Easypaisa" under it).
6. **Order Notes** — optional textarea.
7. **Order summary** — line items (via `ProductImage` thumbnails + name + price, matching the design reference), Subtotal/Delivery/Total via `useCart()` + `lib/delivery.ts`, "Place Order — Rs. `<total>`" submit button, disabled while the submission is pending.
8. **`lib/checkout/cities.ts`** — a fixed list of ~25-30 major Pakistani cities, each mapped to its province (`{ city: "Karachi", province: "Sindh" }`, etc.), plus a lookup helper. The one new data module this phase owns.
9. **`lib/checkout/schema.ts`** — a Zod schema for the fields the client actually submits (name, phone, address, city, landmark, paymentMethod, notes). Deliberately has no `province` field.
10. **`app/(storefront)/checkout/actions.ts`** (`'use server'`) — `createOrder(items, prevState, formData)`: validates via the Zod schema, derives province from the validated city, recomputes `subtotal`/`deliveryCharge`/`total` from `items` + `lib/delivery.ts`, generates the order number via `lib/orders.ts` (retrying up to 3 times on a unique-constraint collision, per `infra/02`'s documented contract), writes the `Order` via `lib/prisma.ts`'s singleton, and redirects to `/order/<orderNumber>` on success — or returns a field-keyed error object on validation failure.
11. **Wired via React 19's `useActionState`** — pending state disables "Place Order"; validation errors surface inline per field.

## Service Interactions

- **Upstream:** `frontend/03` (`useCart`), `frontend/05` (`lib/delivery.ts`), `infra/01` (`Button`, `ProductImage`, tokens), `frontend/01` (`formatPrice`), `infra/02` (`lib/prisma.ts`, `lib/orders.ts`, the `Order` model/enums).
- **Downstream:** `frontend/07` looks up the order by `orderNumber` (already documented in `infra/02`) and calls `clearCart()` once it renders.
- **No Sanity interaction** — cart items are already self-contained price snapshots; nothing here re-fetches product data.

## Architectural Constraints

- **File locations:** `app/(storefront)/checkout/page.tsx`, `app/(storefront)/checkout/actions.ts`, `lib/checkout/cities.ts`, `lib/checkout/schema.ts`.
- **Exactly one `'use client'` file: `page.tsx`.** `actions.ts` carries `'use server'` instead — a different directive, checked separately.
- **New dependency: `zod` only.**
- **Province is populated server-side only, derived from the validated city** — the client-facing Zod schema has no `province` key, so there's nothing to ignore-if-present; it structurally cannot arrive from the client.
- **The server action recomputes `subtotal`/`deliveryCharge`/`total`** from the submitted `items` + `lib/delivery.ts` — matching exactly how `frontend/05` computes the same figures for display, so what the customer sees is what gets persisted.
- **Order-number generation retries up to 3 times** on a Prisma `P2002` (unique constraint) error; a 4th collision is a genuine failure surfaced as a form-level error.

## Definition of Done

**Behavioral**
- [x] Non-empty cart shows Contact/Delivery Address/Payment Method/Order Notes sections plus an order summary matching the cart page's numbers exactly.
- [x] Empty cart (post-hydration) shows a message, no form, no order summary.
- [x] City dropdown offers the curated list; there is no Province select anywhere in the rendered form.
- [x] Submitting with a missing/invalid required field returns a field-specific error and writes nothing to the database.
- [x] Phone must match a Pakistani mobile pattern (10 digits starting with 3, after the fixed +92 prefix) — invalid formats are rejected.
- [x] A valid submission creates exactly one `Order` row: `customerName`/`phone`/`address`/`city` match the input; `province` is correctly derived from the selected city, never from any client-submitted value; `paymentMethod` matches the selected radio (defaulting to `cod`); `notes`/`landmark` are stored when provided, `null` when blank.
- [x] `subtotal`/`deliveryCharge`/`total` on the created Order are recomputed server-side and match `calculateDeliveryCharge`'s rule — verified both under and at/above Rs. 3,000.
- [x] The generated `orderNumber` matches `ZR-YYMMDD-XXXX` and is unique; a forced collision causes a retry that succeeds with a different number rather than failing the request.
- [x] On success, the request redirects to `/order/<orderNumber>` (404 expected until `frontend/07` lands).
- [x] The cart is not cleared by this phase — after a successful submission, cart state is unchanged.
- [x] "Place Order" is disabled while the submission is pending, preventing double-submit.
- [x] The order's items snapshot stores slug, name, price, and quantity per line as they were at submission time, matching the snapshot contract from `frontend/03` — so a later Sanity price edit never changes a past order.
- [x] Cart contents are re-validated server-side, not trusted from the client. The action recomputes subtotal from the submitted items rather than accepting a client-sent total, and rejects a submission with an empty items array.

**Structural**
- [x] All four files exist at their exact paths.
- [x] Exactly `page.tsx` carries `'use client'`; `actions.ts` carries `'use server'`.
- [x] `package.json`'s only new dependency is `zod`.
- [x] `prisma/schema.prisma`, `lib/prisma.ts`, `lib/orders.ts`, `lib/delivery.ts`, and `lib/cart/store.ts` all have no diff.
- [x] Zero hardcoded hex values, zero arbitrary-value classes.

**Testing**
- [x] `npm run build` and `npm run lint` both pass.
- [x] A real order is created against the configured database via a direct test, confirmed by reading it back via `prisma.order.findUnique`, then deleted afterward to avoid leaving test data behind.
- [x] The order-number collision retry is exercised directly (e.g. pre-inserting a row with a known `orderNumber`), not just reasoned about.

## Rollback Criteria

Higher-risk than prior frontend phases — the first phase writing to the database. A `git revert` undoes the code but not any `Order` rows already written; those remain as harmless orphaned records unless manually cleaned up. No schema migration is added — the `province` column already existed from `infra/02`, only how it's populated changes.
