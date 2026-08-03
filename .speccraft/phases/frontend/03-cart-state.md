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
