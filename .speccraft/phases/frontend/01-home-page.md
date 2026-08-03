# Phase: frontend/01 — Home Page

**Branch:** `feature/frontend/home-page`
**Depends on:** infra/01-design-system-setup, infra/02-data-layer-setup
**Effort estimate:** L — first real page, and the primary shared-component factory for the storefront.
**Visual reference:** `stitch/zariya_home_page/screen.png`

---

## Architectural Role

The first customer-facing page and the primary shared-component factory for the storefront. Most later pages import from here rather than rebuilding equivalents.

## Domain Ownership

- `/` route
- **OWNS:** `ProductCard`, `SectionHeading`, `CategoryTile`, `TrustStrip` — later phases import these, never redefine them
- Announcement bar, sticky nav wiring, hero banner with one CTA, four category tiles, bestsellers grid, blush trust strip, new arrivals grid, Instagram strip, footer content

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
