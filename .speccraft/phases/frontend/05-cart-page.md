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
