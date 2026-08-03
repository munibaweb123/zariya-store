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
