# Phase: frontend/08 — Our Story Page

**Branch:** `feature/frontend/our-story-page`
**Depends on:** infra/01-design-system-setup
**Effort estimate:** S — static content, no backend calls, lowest priority.
**Visual reference:** `stitch/zariya_our_story_page/screen.png`

---

## Architectural Role

A lowest-priority, self-contained brand page. Last in build order and has no dependents.

## Domain Ownership

- `/our-story` route
- Static content only — no data fetching, no server actions

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import `Button` (`infra/01`).
- Do not add real founder photography — render an empty `bg-blush` frame at the correct aspect ratio, same documented pattern as `frontend/01`'s Hero image (no image, no icon, no placeholder text).
- Do not reuse or modify `TrustStrip` — it has a fixed, hardcoded 3-item list with no props to customize; this page's three-column section has different icons, labels, and a full description paragraph per item, built as separate markup, not a redefinition.
- Do not add any data fetching, server action, or client interactivity — confirmed by Domain Ownership: static content only. Zero `'use client'` anywhere in this phase.
- Do not add page-specific `metadata` — no prior page phase has done this either; stay consistent.
- Do not build a new nav — the visual reference's own nav cosmetically differs from the site's real `Nav` (`infra/01`-owned, rendered globally via the root layout); the real global `Nav` renders automatically regardless of what this specific mockup shows.
- Do not restyle or restructure `Footer.tsx` beyond the one scoped addition below — no changes to `NAV_LINKS`, the Help column's rendering, or any other column.
- Do not assert unverifiable specific business-practice or history claims in the copy (a founding year, a named artisan-partnership count/program, an award, "fair wages" as a stated practice) — narrative/sentiment language is fine, specific unconfirmed facts are not. See Core Capabilities for what's safe to state now vs. what needs an owner-facing placeholder comment.
- Do not hardcode a hex value or invent new spacing/typography values.

## Core Capabilities

1. **`/our-story` route** (`app/(storefront)/our-story/page.tsx`) — a plain Server Component, zero `'use client'`, zero data fetching.
2. **Header band** (blush) — "Our Story" heading (serif) + "Crafting heritage for the modern woman." eyebrow in `label-caps`.
3. **"The Visionaries" section** — split layout (stacked on mobile, side-by-side on desktop, same pattern as Hero). Image column: empty `bg-blush` frame, no image/icon/placeholder text. Text column: serif heading + brand-story copy adapted from the design reference, with safety edits: the founding narrative ("founded by two friends," "bridging heritage and the contemporary wardrobe") stays, since "two founders" is already confirmed by CLAUDE.md's Users section — but "lifelong friends" (a relationship detail CLAUDE.md doesn't confirm) is wrapped in a code comment flagging it as placeholder for the real owners to verify or replace.
4. **Three-column feature section** — "Handpicked with love" / "Supporting Pakistani artisans" / "Quality you can trust", each with a small inline SVG icon, a heading, and a description paragraph. The middle item's copy is rewritten from the design reference's "we work directly with master craftsmen, ensuring fair wages" (an unverified specific business-practice claim) to sentiment-only language about valuing local craftsmanship and traditional technique, with no operational claim attached. 1-column mobile → 3-column desktop — diverges from `TrustStrip`'s fixed 3-column, since this section's paragraphs need more width per item than `TrustStrip`'s short labels.
5. **Pull-quote section** (blush band) — italicized founder quote + "— The Founders" attribution (no names — none are confirmed).
6. **"Explore our collections" CTA** — heading + `Button` (primary) → `/category/all`.
7. **One scoped `Footer.tsx` edit** — a single new `<li><a href="/our-story">Our Story</a></li>` appended to the Shop column's existing link list (same markup pattern already used there for `NAV_LINKS`), so the page is actually reachable. `NAV_LINKS` itself is untouched — the main top nav does not gain an "Our Story" link, only the footer does.

## Service Interactions

- **Upstream:** `infra/01` only (`Button`, tokens; the global `Nav`/announcement bar already rendered by the root layout; `Footer.tsx` receives the one scoped edit above).
- **Downstream:** none — last-built page, no dependents.
- **No Sanity/Prisma/cart interaction of any kind.**

## Architectural Constraints

- **File locations:** `app/(storefront)/our-story/page.tsx` (new); `components/layout/Footer.tsx` (one-line addition only).
- **Zero `'use client'` anywhere in this phase.**
- **No new dependency.**
- **Responsive layout follows established mobile-first patterns** (Hero's stacked-then-side-by-side split; the feature grid at 1-column mobile → 3-column desktop, per the reasoning above).
- **Copy standard:** narrative/sentiment claims about founding story and values are fine; specific unconfirmed facts (dates, named partnerships/programs, counts, awards, stated operational practices like wage policies) are not stated as fact. Anything not confirmed by CLAUDE.md gets a code comment marking it as placeholder for the store owners to confirm or replace — not silently asserted.

## Definition of Done

**Behavioral**
- [x] `/our-story` renders the header band, "The Visionaries" section (empty blush image frame + copy), the three-column feature section, the pull-quote, and the "Explore our collections" CTA, all with real (non-lorem) copy.
- [x] The founders image column renders as an empty `bg-blush` frame — no image, no icon, no placeholder text.
- [x] "Explore our collections" links to `/category/all`.
- [x] The page renders identically regardless of any cart/session state — confirmed since the page has zero `'use client'` and zero data fetching.
- [x] Global Nav, announcement bar, and Footer render exactly as on every other page (inherited from the root layout, not rebuilt here).
- [x] The page is linked from somewhere reachable — `/our-story` appears in the Footer's Shop column as a real link, alongside the existing category links.
- [x] Copy is real, brand-specific, and factually safe: describes two founders and a Pakistani boutique without inventing verifiable claims (no fabricated founding year, no invented artisan-partnership program, no awards, no stated wage/sourcing policy). Anything the owners must confirm (e.g. "lifelong friends") is written as placeholder copy clearly marked in a code comment for them to replace.

**Structural**
- [x] `app/(storefront)/our-story/page.tsx` exists.
- [x] Zero `'use client'` anywhere in this phase's file.
- [x] `package.json` has no diff.
- [x] `TrustStrip.tsx` has no diff — this phase's feature section is separate markup.
- [x] `Footer.tsx`'s only diff is the added `/our-story` link — no restyling, no restructuring, `NAV_LINKS` and the Help column unchanged.
- [x] Zero hardcoded hex values, zero arbitrary-value classes.

**Testing**
- [x] `npm run build` and `npm run lint` both pass; the page prerenders as fully static.
- [x] Manual check at ≥2 viewport widths confirms the Visionaries split and the three-column feature section both respond correctly.

## Rollback Criteria

Lowest-risk phase in the project — no data, no schema, no state, one new static file plus a one-line addition to an existing file. `git revert` is sufficient.
