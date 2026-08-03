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
<!-- To be detailed in /sc.plan step 2 -->

- Do not recreate a component another phase owns — import it.

## Core Capabilities
<!-- To be filled in /sc.plan step 2: intent and patterns, not code -->

## Service Interactions
<!-- To be filled in /sc.plan step 2: upstream/downstream integrations -->

## Architectural Constraints
<!-- To be filled in /sc.plan step 2: phase-specific constraints only -->

## Definition of Done
<!-- To be filled in /sc.plan step 2: behavioral, structural, testing criteria -->

## Rollback Criteria
<!-- To be filled in /sc.plan step 2, if this is a high-risk phase -->
