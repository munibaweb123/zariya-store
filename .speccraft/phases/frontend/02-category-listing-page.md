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
- **Special slug `all`:** `/category/all` reuses this exact route/page with no category filter applied — the Sanity query branches to omit the `category` filter when `slug === "all"`, showing products across all four categories. This is the "All" state the filter chips already need per the design, not a separate page. Discovered/decided during `frontend/01`'s planning — `frontend/01`'s home page links to `/category/all?sort=featured` (Bestsellers "View All") and `/category/all?sort=newest` (New Arrivals "Explore More"), so this route must handle a `?sort=` query param (at least `featured` and `newest` values) driving the initial sort order shown, in addition to whatever `SortDropdown` UI this phase builds.

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import it.
- Do not add a subcategory field to the Sanity schema — `FilterChips` switches category, it does not filter within one.
- Do not build separate page files per category (`/category/dresses`, etc.) — one dynamic `[slug]` route handles all four categories plus `all`.
- Do not add cart-state or an "Add to Cart" affordance to `ProductGrid`/`ProductCard` — `ProductCard` (owned by `frontend/01`) stays click-through only.
- Do not build `/product/[slug]` — `frontend/04`'s job; `ProductCard` links there and 404s until it lands, same pattern as elsewhere.
- Do not implement Load More as infinite scroll/`IntersectionObserver` — it's a plain link that re-navigates with a larger `?limit=`, no scroll listener, no client fetch.
- Do not invent sort options beyond the four confirmed (`featured`, `newest`, `price-asc`, `price-desc`).
- Do not query Sanity from a client component — all fetching happens in `app/(storefront)/category/[slug]/page.tsx`.
- Do not modify `infra/02`'s existing `lib/sanity/queries.ts` exports — add exactly one new function.
- Do not hardcode a hex value or invent new spacing/typography tokens.

## Core Capabilities

1. **`/category/[slug]` dynamic route** — the four real categories plus the special `all` slug (no category filter). Any other slug calls `notFound()`.
2. **Breadcrumb** — "Home / `<Category Label>`" above the header band.
3. **Category header on a blush band** — renders `SectionHeading` (imported from `frontend/01`, title only, no link) for the title, plus a one-line description beneath it. Both sourced from a static local `CATEGORY_META: Record<Category | "all", { label, description }>` map — there's no Sanity category document/description field, same kind of documented placeholder as `frontend/01`'s category-tile imagery. Comment this clearly so a future phase knows to replace it with real Sanity-managed copy if the owners need to edit it themselves.
4. **`FilterChips`** — category switcher, present on every category page including single-category ones. Chips: All, Dresses, Perfumes, Beauty, Jewellery. The chip matching the current route is active (filled maroon, white text); others are white with a hairline border. Each chip is a `Link` to `/category/<slug>` (`All` → `/category/all`). No client state — pure Server Component navigation does the filtering. *Recorded reasoning:* the mockup's chips read as subcategories (Earrings, Necklaces...) that don't exist in the v1 schema and are out of scope to add; rather than hide the row on single-category pages (which would strand a customer landing directly on `/category/jewellery` from Instagram), the row keeps its visual position and becomes a real category switcher. If subcategories are ever added to the schema, this is where they'd go, and the category switcher would move to a different affordance.
5. **`SortDropdown`** — Featured / Newest / Price: Low to High / Price: High to Low. State lives entirely in `?sort=` (default `featured` when absent); changing it navigates to the same route with a new query param. Price sorts use the *effective* price (`salePrice` when set and lower than `price`, else `price`) — computed inside the GROQ `order()` clause via `coalesce()`, not recomputed ad hoc elsewhere. May be a small `'use client'` leaf for the `onChange` → route-push handler; nothing above it becomes a client component.
6. **Product count** — total matching products for the current category + sort state, not just the number currently rendered.
7. **`ProductGrid`** — renders `ProductCard` (imported from `frontend/01`, never redefined) in the established 2-col mobile / 4-col desktop grid; zero-product state renders a plain message, no broken/collapsed layout.
8. **Load more** — link-based pagination via a `?limit=` query param (starts at 12; Load More links to the same URL with `limit` + 12), re-fetching the full sorted/filtered set and slicing server-side. No infinite scroll, no client fetch, no cursor. See Architectural Constraints for the exact mechanism.
9. **`listCategoryProducts(category: Category | "all", sort: SortOption)`** — the one new function added to `lib/sanity/queries.ts`; existing exports untouched.

## Service Interactions

- **Upstream:** `infra/01` (`Button`, tokens; `Nav`'s existing category links now resolve instead of 404ing), `infra/02` (Sanity client/query pattern), `frontend/01` (`ProductCard`, `SectionHeading` — both imported directly, per this phase's header dependency).
- **Downstream:** none — this is a leaf page in the build order. `frontend/04`'s "related products" (if it needs a category listing) would reuse `listProductsByCategory` (the existing, unmodified `infra/02` function), not this phase's new `listCategoryProducts`.
- **Query load:** one Sanity fetch per render (`listCategoryProducts`), consistent with the project's fetch-minimization pattern.
- **Dangling routes are expected:** `/product/<slug>` still 404s until `frontend/04` lands.

## Architectural Constraints

- **File locations:** `app/(storefront)/category/[slug]/page.tsx`, `components/category/FilterChips.tsx`, `components/category/SortDropdown.tsx`, `components/category/ProductGrid.tsx` (page-specific composition directory, parallel to `frontend/01`'s `components/home/`).
- **Exactly one `'use client'` file in this phase:** `SortDropdown.tsx`. `FilterChips`, `ProductGrid`, and the page itself are Server Components.
- **Load more is URL-driven, not client state — this is load-bearing given the "exactly one `'use client'` file" constraint above.** The current `limit` (and `category`/`sort`) live in the route's search params. "Load more" renders as a plain `Link`/`<a>` to the same `/category/[slug]` route with `?...&limit=<current + 12>` — a normal navigation, not a client fetch or `onClick` handler. The page re-runs `listCategoryProducts`, re-sorts, and slices to the new `limit` server-side. This keeps the page a Server Component, makes every "page" of results a shareable/bookmarkable URL, and makes the browser back button behave correctly. Implementation must not reach for `useState`/`IntersectionObserver`/a second `'use client'` component to do this — that would silently break the structural check that expects `SortDropdown.tsx` as the *only* client file.
- **`listCategoryProducts` is the one new `lib/sanity/queries.ts` export** — `getProductBySlug`, `listProductsByCategory`, `listFeaturedProducts`, `listNewArrivals`, `listCategoryPreviews` remain unmodified.
- **Bounded-catalog assumption:** `listCategoryProducts` fetches the *full* matching set in one query (not server-paginated) since the catalog is boutique-scale; "Load more" and the product count are computed by slicing/measuring that array in the page. Documented here so a future phase revisits it if the catalog ever grows into the thousands.
- **Grid columns:** 2-col mobile / 4-col desktop, same breakpoint rule as `frontend/01` — no new breakpoint invented.
- **No new dependency:** no pagination library, no dropdown/select package — `SortDropdown` is a native `<select>` or equivalent hand-built control.
- Sanity ISR window stays 60s, same as every other query.

## Definition of Done

**Behavioral**
- [x] Each of `/category/dresses`, `/category/perfumes`, `/category/beauty`, `/category/jewellery` renders only that category's products; `/category/all` renders the union of all four.
- [x] An unknown slug returns a real 404 (`notFound()`), not an empty page.
- [x] Breadcrumb reads "Home / `<Category Label>`".
- [x] Category header on a blush band shows a title (via `SectionHeading`) and one-line description from `CATEGORY_META`.
- [x] `FilterChips` render all five options on every category page; the chip matching the current route is visually active; each links correctly.
- [x] `SortDropdown` offers all four options; changing it updates `?sort=` and re-renders in the new order; default (no `?sort=`) behaves as `featured`.
- [x] `/category/all?sort=featured` and `/category/all?sort=newest` (`frontend/01`'s existing links) render successfully with the expected order.
- [x] Price sorts use the effective price — a discounted item sorts by its sale price, not its original price.
- [x] Product count reflects the total matching count, not just the currently-rendered subset.
- [x] An empty category renders a plain empty-state message — no broken grid, no 404.
- [x] Load more reveals additional products without duplicates and without losing the current sort.
- [x] Load more preserves the sort AND the current category in the URL, and the revealed products continue the same ordering — no re-shuffle, no duplicates, no items skipped at the page boundary.
- [x] Deep-linking works: opening `/category/all?sort=price-asc` directly (not by clicking) renders correctly, and `SortDropdown` shows that option as selected rather than defaulting to featured.

**Structural**
- [x] All four files exist at their exact paths.
- [x] Exactly one `'use client'` file (`SortDropdown.tsx`) — checked via grep.
- [x] Zero hardcoded hex values, zero arbitrary-value classes in this phase's files.
- [x] `package.json` has no diff.
- [x] `lib/sanity/queries.ts`'s existing exports are unmodified — only `listCategoryProducts` (+ `SortOption` type) is new.
- [x] `ProductCard`/`SectionHeading` are imported, not redefined.

**Testing**
- [x] `npm run build` and `npm run lint` both pass.
- [x] Manual check at ≥2 viewport widths confirms grid/chip responsive behavior.
- [x] Manual check against the live seeded dataset: each category shows correct real products; all four sorts visibly reorder a category containing a sale item.

## Rollback Criteria

Low-risk — one route, three new components, one new read-only query function, no data writes. `git revert` of the branch is sufficient. Same caveat as `frontend/01`: check whether a later phase has imported `listCategoryProducts` before reverting.
