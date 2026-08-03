# Phase: frontend/01 — Home Page

**Branch:** `feature/frontend/home-page`
**Depends on:** infra/01-design-system-setup, infra/02-data-layer-setup
**Effort estimate:** L — first real page, and the primary shared-component factory for the storefront.
**Visual reference:** `stitch/zariya_home_page/screen.png`

---

## Architectural Role

The first customer-facing page and the primary shared-component factory for the storefront. Most later pages import from here rather than rebuilding equivalents.

## Domain Ownership

- `app/(storefront)/page.tsx` — the `/` route
- **OWNS:** `components/ui/ProductCard.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/CategoryTile.tsx`, `components/ui/TrustStrip.tsx` — later phases import these, never redefine them
- `lib/format.ts` — `formatPrice(amount: number): string` → `"Rs. 1,850"`. This is the one shared **formatting** primitive: every phase that displays a price (`frontend/02`, `04`, `05`, `06`, `07` — cart lines, order summary, confirmation) imports it rather than writing its own `"Rs. "` string concatenation. `ProductCard` (below) separately owns the **presentation** decision on top of it — which price is primary, strikethrough treatment, the `SALE` badge — so a page needing a bare formatted price imports `formatPrice`, and a page needing the full sale-aware card presentation imports `ProductCard`.
- One new function, `listCategoryPreviews()`, added to `lib/sanity/queries.ts` (already owned by `infra/02`) — a single-round-trip query returning the first product per category, used by the tiles below (see Architectural Constraints for why this must be one query, not four). **Ownership boundary:** this phase may *add* that one new exported function to the file; it must not modify or refactor `infra/02`'s existing functions (`getProductBySlug`, `listProductsByCategory`, `listFeaturedProducts`, `listNewArrivals`), the Sanity client setup, or the shared 60s revalidate window. The function is named concretely here specifically so `frontend/02` doesn't later add a near-duplicate under a different name.
- Hero banner with one CTA, four category tiles, bestsellers grid, blush trust strip, new arrivals grid, Instagram strip (static placeholder). Announcement bar/nav/footer are already rendered by `infra/01`'s root layout — this phase does not touch them, just fills the page content between them.

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import it. Specifically: `Nav`, `Footer`, `MobileMenu`, `NavCartBadge`, `Button`, `ProductImage` (`infra/01`) and `lib/sanity/queries.ts`, `lib/prisma.ts` (`infra/02`) are all reused as-is, never redefined.
- Do not build `/category/[slug]` or `/category/all` — that route (including the `all`/`?sort=` handling) belongs to `frontend/02`. This phase only links to it.
- Do not build `/product/[slug]` — `frontend/04`'s job. `ProductCard` here is click-through only (wraps the whole card in a link to the product page); it has no "Add to Cart" affordance, since `frontend/03-cart-state` doesn't exist yet and the design reference shows no cart action on these cards anyway.
- Do not add cart-state, a cart count, or any client-side interactivity to this page. The whole page is server-rendered; nothing here needs `'use client'`.
- Do not add a real Instagram API/embed integration. The Instagram strip is 6 static blush-colored placeholder blocks — no fake photos, no live feed, no new dependency.
- Do not invent a generic "all products"/"collection" page beyond what's already decided: `/category/all` is `frontend/02`'s route handling an unfiltered slug, not a new page type owned here.
- Do not treat category-tile imagery as a permanent design decision. It currently derives from `listProductsByCategory(category)[0]`'s image (see Core Capabilities) — this is a documented placeholder, not a feature. Comment this clearly in `CategoryTile`'s usage so a future phase knows to replace it with real category hero photography (a dedicated Sanity field or static asset) rather than assuming product order is meaningful to the home page.
- Do not let an empty category (zero products) break the tile — `CategoryTile` must render its blush background and label with no image and no layout collapse when a category has no seeded/real products yet (a real possibility in production before the owners finish entering the catalog).
- Do not let empty Bestsellers or New Arrivals results break the page. If no featured products exist (also possible pre-launch), the section either renders nothing at all — heading included — or renders with fewer than four cards without collapsing the grid. It must never render an empty section with a heading and no content beneath it.
- Do not render the `SALE` badge or the strikethrough price unless `salePrice` exists **and** is lower than `price`. Do not compute or display a discount percentage — the design shows none. Price display logic (which price is primary, how the strikethrough renders) lives in `ProductCard`, owned here — `frontend/02`/`frontend/04` import it rather than reimplementing price rendering.
- Do not query Sanity from a client component — all fetching here is server-side via `lib/sanity/queries.ts`, consistent with `infra/02`'s constraint.
- Do not hardcode a hex value, invent new spacing/typography values, or restyle a raw `<button>` — reuse the token system and `Button` from `infra/01`.

## Core Capabilities

1. **Hero banner** — split layout matching the design reference's proportions (text column + image column side by side on desktop, stacked on mobile with text first). Text column: `label-caps` eyebrow, serif headline, body paragraph, primary `Button` ("Shop Collection" → `/category/dresses`). Image column: a `bg-blush` empty frame at the correct aspect ratio/dimensions — **no image, no icon, no placeholder text**. Documented reasoning (keep this comment in the component): the hero is a full-width composition with overlaid text where contrast and focal point matter; substituting a portrait product thumbnail would verify a layout that will never ship and would hide problems only real photography reveals. An empty frame at correct dimensions verifies the layout honestly. Note: hero imagery is intentionally absent until real marketing photography exists — drop a static asset into `/public` and reference it here, or add a hero image field to Sanity if the owners should control it.
2. **Category tiles** — four tiles (Dresses, Perfumes, Beauty, Jewellery), each linking to `/category/<slug>`. Image shown is `listProductsByCategory(category)[0]`'s product image (no new query). Documented as a placeholder behavior, not a permanent feature (comment in `CategoryTile` + noted here): tile imagery currently derives from the first product in each category; when real category hero photography exists, replace with a dedicated image field (a Sanity category document, or a static asset per category) — otherwise changing a product's order would silently change the home page. Empty-category case: render the `bg-blush` background and label with no image, no broken image, no layout collapse.
3. **Bestsellers section** — `SectionHeading` ("Bestsellers", "View All" → `/category/all?sort=featured`) + a grid of `ProductCard`s from `listFeaturedProducts(4)`. Empty-safe per Anti-Patterns.
4. **Trust strip** — `TrustStrip`, blush background, three columns with a small inline-SVG icon + `label-caps` text each: "Handpicked Quality", "Cash on Delivery", "Nationwide Shipping" (matching the design reference exactly).
5. **New Arrivals section** — `SectionHeading` ("New Arrivals", "Explore More" → `/category/all?sort=newest`) + a grid of `ProductCard`s from `listNewArrivals(4)`. The single most-recent result (first item) gets a `highlightNew` flag from the page — "new" is a presentational decision made here, not a stored schema field. Empty-safe per Anti-Patterns.
6. **Instagram strip** — heading ("Follow us @zariya_heritage") + tagline, then 6 static `bg-blush` placeholder blocks (no fake photos, no live feed), horizontal-scroll on mobile / grid on desktop, no visible scrollbar (matching `infra/01`'s established scroller convention).
7. **`ProductCard`** — `ProductImage` + name (charcoal) + price (maroon, via `formatPrice`). Sale handling: `SALE` badge (maroon) + strikethrough original price, shown only when `salePrice` exists and is lower than `price` — no discount percentage. Optional `highlightNew` prop renders a charcoal `NEW` badge. The whole card is a single link to `/product/<slug>` (404s until `frontend/04` lands — acceptable, same pattern as `infra/01`'s nav links to `frontend/02`). No "Add to Cart" affordance.
8. **`SectionHeading`** — title (`headline-md-mobile`/`headline-md`) plus an optional right-aligned link, reusable as-is by later listing-style phases.
9. **`formatPrice`** (`lib/format.ts`) — `(amount: number) => "Rs. 1,850"` (comma-separated, whole rupees).
10. **Responsive layout throughout** — mobile-first; category tiles and product grids go 2-column on mobile → 4-column on desktop, per the project's established responsiveness rule.

## Service Interactions

- **Upstream:** `infra/01` (`Button`, `ProductImage`, the token system, the root layout shell) and `infra/02` (`listProductsByCategory`, `listFeaturedProducts`, `listNewArrivals`, plus the seeded `development` dataset). Both must be complete and the dataset seeded before this phase can be verified against real data.
- **Downstream ownership:** `ProductCard`, `SectionHeading`, `CategoryTile`, `TrustStrip`, and `lib/format.ts`'s `formatPrice` are all owned here. `frontend/02` imports `ProductCard` and `SectionHeading` for its grid; `frontend/04` imports `ProductCard` (related products) and `formatPrice` (detail price); `frontend/05`, `06`, `07` import `formatPrice` for cart lines, the order summary, and the confirmation page.
- **Query load is a performance constraint, not just an implementation detail.** Naively this page would issue six Sanity fetches per render — four separate `listProductsByCategory` calls (one per tile) plus `listFeaturedProducts` and `listNewArrivals`. That conflicts with the "usable on a mid-range Android phone on 3G" success criterion on the site's most-visited page. The four tile queries are consolidated into one new query (added to `lib/sanity/queries.ts`) that returns the first product per category in a single round trip — three total fetches per render, not six.
- **Dangling routes are expected.** `/category/dresses`, `/category/all`, and `/product/<slug>` don't exist yet and will 404 until `frontend/02` and `frontend/04` land — same pattern as `infra/01`'s nav links. Do not stub placeholder pages for them.

## Architectural Constraints

- **File locations are load-bearing**, same pattern as the `infra` phases: `components/ui/ProductCard.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/CategoryTile.tsx`, `components/ui/TrustStrip.tsx` (shared, reusable — same directory as `infra/01`'s `Button`/`ProductImage`), `components/home/Hero.tsx` and `components/home/InstagramStrip.tsx` (page-specific composition, not reused elsewhere), `lib/format.ts`, and the new `listCategoryPreviews` export inside the existing `lib/sanity/queries.ts`.
- **Zero `'use client'` anywhere in this phase.** The entire page is server-rendered, including `ProductCard` — it's a link, not an interactive element, and needs no client-side state.
- **The Instagram strip's horizontal scroll is CSS-only** (`overflow-x` with a hidden scrollbar via a utility class) — no JS carousel library, no scroll listener, consistent with `infra/01`'s established scroller convention.
- **Grid columns come from the project's established responsive rule, not per-section ad-hoc breakpoints:** 2-column mobile → 4-column desktop for both the category tiles and the product grids, matching the same breakpoint pattern already used elsewhere — don't invent a different column count or breakpoint for one section.
- **No new dependency of any kind.** This phase adds nothing to `package.json` — no icon library, no carousel library, no image-gallery package. Icons (if any) are inline SVGs; everything else is composed from what `infra/01`/`infra/02` already provide.
- **Sanity fetches happen only at the page level, not inside child components.** `app/(storefront)/page.tsx` issues all three queries (`listCategoryPreviews`, `listFeaturedProducts`, `listNewArrivals`) and passes the results down as props. `ProductCard`, `CategoryTile`, `Hero`, and the section components receive data — they never fetch it themselves. Otherwise the six-to-three query consolidation is defeated the moment a component decides to fetch its own data, and the fetch count becomes untrackable.

## Definition of Done

**Behavioral**
- Hero renders the text column (eyebrow, headline, paragraph, `Button`) and an empty `bg-blush` image frame at the correct dimensions — no image, no icon, no placeholder text in that frame.
- The hero `Button` links to `/category/dresses`.
- Four category tiles render, each linking to `/category/<slug>` and showing the real seeded first-product image for that category via `listCategoryPreviews`.
- Bestsellers section shows "Bestsellers" + "View All" (→ `/category/all?sort=featured`) and up to 4 `ProductCard`s from `listFeaturedProducts`.
- Trust strip shows exactly three items: "Handpicked Quality", "Cash on Delivery", "Nationwide Shipping".
- New Arrivals section shows "New Arrivals" + "Explore More" (→ `/category/all?sort=newest`) and up to 4 `ProductCard`s from `listNewArrivals`, with the first (most recent) card showing a `NEW` badge.
- `ProductCard` shows the `SALE` badge and strikethrough original price only when `salePrice` is set and lower than `price` — never a discount percentage.
- Instagram strip shows the heading, tagline, and exactly 6 static `bg-blush` blocks — no real images, no live fetch.
- **Empty-state behavior is explicitly tested, not assumed:** temporarily pointing at an empty dataset (or mocking empty results) confirms — a category tile with zero products renders blush + label, no broken image, no collapse; Bestsellers/New Arrivals with zero results render with no heading and no content (or fewer than 4 cards without collapsing the grid) — never a heading over an empty section.

**Structural** (runnable checks, not eyeballed)
- All files from Domain Ownership exist at their exact paths.
- Zero `'use client'` anywhere in this phase's files. Check: `grep -rl "use client" app/(storefront)/page.tsx components/ui/ProductCard.tsx components/ui/SectionHeading.tsx components/ui/CategoryTile.tsx components/ui/TrustStrip.tsx components/home/ lib/format.ts` returns no matches.
- Zero hardcoded hex values and zero arbitrary-value classes in this phase's files, same standard as `infra/01`. Check: `grep -rE "#[0-9a-fA-F]{3,8}" app/(storefront)/page.tsx components/ui/ProductCard.tsx components/ui/SectionHeading.tsx components/ui/CategoryTile.tsx components/ui/TrustStrip.tsx components/home/` and `grep -rE "(bg|text|border)-\[" [same paths]` both return zero matches.
- `package.json` has no diff. Check: `git diff develop -- package.json` (or the appropriate base branch) returns empty.
- The page issues exactly three Sanity fetches. Check: `page.tsx` calls `listCategoryPreviews`, `listFeaturedProducts`, and `listNewArrivals` — one call each, no per-component fetching (verifiable by grep for query-function calls being confined to `page.tsx`).
- `lib/sanity/queries.ts`'s existing exports (`getProductBySlug`, `listProductsByCategory`, `listFeaturedProducts`, `listNewArrivals`) are unmodified — only `listCategoryPreviews` is newly added.

**Testing**
- `npm run build` succeeds (no TypeScript errors) and `npm run lint` passes.
- Manual check at ≥2 viewport widths confirms category tiles and product grids go 2-column on mobile → 4-column on desktop.
- Manual check against the live seeded `development` dataset confirms all sections render with real data matching the design reference's layout/hierarchy.

## Rollback Criteria

Low-risk, no data writes, no migrations, no external state — a `git revert` of this branch is sufficient.

One caveat worth recording: this phase adds `listCategoryPreviews` to `lib/sanity/queries.ts`, a file owned by `infra/02`. A plain revert removes that export along with everything else this phase added. Nothing else depends on it today, so that's safe right now — but before reverting later, check whether any phase built after this one has come to import `listCategoryPreviews`, since a blind revert at that point would break it too.
