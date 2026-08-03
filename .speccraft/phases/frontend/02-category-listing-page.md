# Phase: frontend/02 — Category Listing Page

**Branch:** `feature/frontend/category-listing-page`
**Depends on:** infra/01-design-system-setup, infra/02-data-layer-setup, frontend/01-home-page (imports `ProductCard`, `SectionHeading`)
**Effort estimate:** M
**Visual reference:** `stitch/zariya_category_page/screen.png`

---

## Architectural Role

Delivers the "browse and filter" step of the discovery flow, sitting between the home page and the product detail page.

## Domain Ownership

- `/category/[slug]` route
- **OWNS:** `FilterChips`, `SortDropdown`, `ProductGrid`
- Breadcrumb, category header on blush band, product count, load more

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
