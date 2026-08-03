# Phase: infra/02 — Data Layer Setup

**Branch:** `feature/infra/data-layer-setup`
**Depends on:** None (foundation phase)
**Effort estimate:** M — Sanity project + Studio + schema, Prisma schema + Neon Postgres connection + initial migration.

---

## Architectural Role

Stands up the two persistence systems the product depends on: Sanity for the content the store owners edit themselves, and Postgres for the orders the site writes. No page can fetch a product or create an order until this phase exists.

## Domain Ownership

- Sanity project config and Studio route/deployment
- Product schema: `name`, `slug`, `price`, `salePrice`, `category`, `images`, `description`, `inStock`, `featured`
- Sanity client + typed query helpers
- Prisma schema (`Order` model), Neon Postgres connection, initial migration

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
