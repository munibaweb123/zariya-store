# Project

## Scenario: Startup / SaaS
**Product:** An online storefront where Pakistani customers browse and order dresses, perfumes, beauty products, and handmade jewellery with cash-on-delivery checkout confirmed over WhatsApp.
**Audience:** Pakistani women aged 18-35 shopping on mobile, who discover the brand through Instagram, expect cash-on-delivery, and prefer to confirm orders over WhatsApp rather than create an account.
**Core flows:** 1. Browse and discover — customer lands on the home page (often from an Instagram link), taps a category tile or a bestseller, filters the category listing, and opens a product detail page with photos, price, and description.
**Priority:** Build for real users. Maintainability matters.

---

## Working Mode
Before making any technical decision (database, framework, pattern, library, architecture choice),
present 2-3 options with one-line trade-offs and wait for confirmation before implementing.
Never pick a stack component without asking first.

---

## Users

**Primary — customers.** Pakistani women aged 18–35 shopping on mobile, who discover the brand through Instagram, expect cash on delivery, and prefer to confirm orders over WhatsApp rather than create an account.

**Secondary — store owners.** Two founders who manage products, prices, images, and stock through Sanity Studio and confirm incoming orders on WhatsApp. Not developers — must never need to touch code to add a product.

Orders are fulfilled manually: owner confirms on WhatsApp, ships via a local courier (TCS / Leopard / PostEx), cash collected on delivery.

---

## Core User Flows

1. **Browse and discover** — home page (often from an Instagram link) → category tile or bestseller card → filtered category listing → product detail page with photos, price, description.
2. **Order with cash on delivery** — add to cart → adjust quantity → cart → guest checkout (name, phone, address, city, province) → select Cash on Delivery → place order. Server action validates input and writes order to Postgres → confirmation page shows order number and a WhatsApp button pre-filled with order details.
3. **Manage the store** — owner adds/edits products, prices, sale prices, images, categories, stock status in Sanity Studio. Changes appear on the storefront without a code deploy.

---

## Pages

1. **Home** (`/`) — announcement bar, sticky nav, hero banner with one CTA, four category tiles, bestsellers grid, blush trust strip, new arrivals grid, Instagram strip, footer
2. **Category listing** (`/category/[slug]`) — breadcrumb, category header on blush band, product count and sort dropdown, filter chips, product grid, load more
3. **Product detail** (`/product/[slug]`) — image gallery with thumbnails, name, price with sale handling, short description, quantity stepper, add to cart, WhatsApp order button, accordion sections, related products
4. **Cart** (`/cart`) — line items with quantity steppers and remove links, order summary card, empty state
5. **Checkout** (`/checkout`) — guest only. Contact fields (name, phone), delivery address (address, city, province, optional landmark), payment method selector (COD default, bank transfer secondary), order notes, sticky order summary
6. **Order confirmation** (`/order/[orderNumber]`) — success state, order number, summary, delivery estimate, "Confirm on WhatsApp" button
7. **Our Story** (`/our-story`) — static content, no backend calls. In scope, lowest priority — build last.

---

## Tech Stack

- **Framework:** Next.js 16.2.12 (App Router), TypeScript strict mode — corrected from "Next.js 15" during `infra/01`; the installed version is what's in `package.json`, not the original placeholder
- **Styling:** Tailwind CSS v4.3.3 — design tokens only, no arbitrary hex values in components. CSS-first config (`@theme` in `app/globals.css`), not `tailwind.config.ts` — see Conventions
- **Content:** Sanity CMS (`sanity@6.8.0`, `next-sanity@13.2.3`) for products (name, slug, price, salePrice, category, images, description, inStock, featured). Two datasets: `production` (real catalog) and `development` (sample/seed data only — see Conventions)
- **Database:** Neon Postgres with Prisma 7 (`prisma@7.9.1`) — orders only. Prisma 7 requires a driver adapter (`@prisma/adapter-pg` + `pg`); connection config lives in `prisma.config.ts`, not `schema.prisma` — see Conventions
- **Mutations:** Next.js server actions. No separate API layer, no Express, no FastAPI.
- **Cart state:** client-side, persisted to localStorage. No cart records in the database.
- **Images:** next/image with Sanity's CDN
- **Hosting:** Vercel

---

## Design System

Non-negotiable. The project runs Tailwind v4 (`@tailwindcss/postcss`, `@import "tailwindcss"` in `app/globals.css`), which is CSS-first — there is no `tailwind.config.ts`. Define the six tokens as CSS custom properties inside an `@theme` block in `app/globals.css` (e.g. `--color-cream: #FCF9F8;`), which Tailwind turns into utilities (`bg-cream`, `text-maroon`, etc.) automatically. Reference by class name everywhere. Zero hardcoded hex outside that `@theme` block.

| Token | Hex | Use |
|---|---|---|
| `cream` | `#FCF9F8` | page background |
| `white` | `#FFFFFF` | nav bar, cards |
| `charcoal` | `#2B2B2B` | primary text, footer background |
| `maroon` | `#7A1E3A` | primary buttons, sale badges, category tags, prices |
| `blush` | `#F8F3F4` | alternating section backgrounds, image placeholders |
| `line` | `#EDE6E8` | hairline borders and dividers |

Ignore the `colors:` block in `stitch/DESIGN.md` completely — it's an auto-generated Material Design 3 palette (45+ tokens). Use only the six tokens above, and nothing else, anywhere in the codebase. DESIGN.md's typography scale, spacing scale, shape rules, and component specs are otherwise correct and should be used.

**Fonts:** EB Garamond (headings, serif) and Plus Jakarta Sans (body/UI, sans), both via `next/font/google`.

**Spacing scale (from DESIGN.md):** 8px base unit; section gaps 48px mobile / 80px desktop; grid margins 16px mobile / 40px desktop; gutter 16px.

**Shape:** 2px border radius on buttons and inputs; product imagery keeps sharp 90° corners.

**Visual language:** Minimal premium (Khaadi/Sapphire style). White/cream-dominant pages where product photography carries the visual weight; maroon appears only on buttons, badges, tags, and prices. Generous whitespace, no drop shadows, no gradients, uppercase letter-spaced small labels, hairline dividers instead of card borders.

**Components (from DESIGN.md):**
- Buttons: primary = solid maroon/white text/2px radius/no shadow; secondary = transparent with 1px charcoal border; min 48px touch target height.
- Product cards: vertical, portrait image on blush background, charcoal title, bold maroon price.
- Nav: desktop minimal white bar with `label-caps` links; mobile fixed top bar with hamburger, search, bag icons.
- Inputs: 1px hairline border (or bottom-border-only variant); focus state border → charcoal or maroon.
- Badges: small rectangular tags, 0–2px radius, maroon (sale) or charcoal (new), white `label-caps` text.
- Horizontal scrollers (mobile "related products") with no visible scrollbars.

**Responsiveness:** Mobile-first. Desktop reuses the same components at wider breakpoints — 2-column product grids become 4-column, stacked sections become 2-column, hamburger becomes horizontal nav.

**Visual references:** one flat folder per page under `stitch/`, named `{brand}_{page}_page/` (H0 hackathon convention):

```
stitch/
├── DESIGN.md                            (shared design system, top level)
├── zariya_home_page/screen.png
├── zariya_category_page/screen.png
├── zariya_product_page/screen.png
├── zariya_cart_page/screen.png
├── zariya_checkout_page/screen.png
├── zariya_confirmation_page/screen.png
└── zariya_our_story_page/screen.png
```

Every phase file must carry a `Visual reference:` line pointing at the exact `screen.png` for that page (same convention as PropFlow phase files). Each folder's `code.html` is layout reference ONLY — never copy that markup into components; rebuild as React with Tailwind design tokens.

---

## Conventions

Established in `infra/01-design-system-setup` (the first phase built):

- **Tailwind v4 is CSS-first.** There is no `tailwind.config.ts`/`.js` — the six color tokens, typography scale, and spacing scale live in a single `@theme` block in `app/globals.css`. Do not create a JS/TS Tailwind config; do not scatter tokens across multiple CSS files.
- **Font variables:** `next/font/google` loaders use `variable: '--font-eb-garamond'` and `variable: '--font-plus-jakarta-sans'` in `app/(storefront)/layout.tsx` (moved here from `app/layout.tsx` during `infra/02` — see below); the `@theme` block maps these to `--font-heading`/`--font-body`, which back the `font-heading`/`font-body` utilities. Both fonts load with `subsets: ['latin']`, `display: 'swap'`, and an explicit weight list only (EB Garamond: `500`; Plus Jakarta Sans: `400, 600, 700`) — never load a full font family.
- **Component locations are fixed:** shared layout pieces live in `components/layout/` (`Nav.tsx`, `Footer.tsx`, `MobileMenu.tsx`, `NavCartBadge.tsx`, `nav-links.ts`), shared primitives in `components/ui/` (`Button.tsx`, `ProductImage.tsx`). New shared components follow this same split — layout chrome vs. reusable UI primitives.
- **`Button` is the only button.** Every CTA/action imports `components/ui/Button.tsx` (`variant="primary" | "secondary"`, optional `href` to render as a link) instead of styling a raw `<button>`.
- **`ProductImage` is the only product-photo frame.** `components/ui/ProductImage.tsx` wraps `next/image` in the blush/sharp-corner/no-shadow frame — any page rendering product photography uses it instead of inventing its own wrapper.
- **`NavCartBadge` is the one seam for live cart state.** `components/layout/NavCartBadge.tsx` is a `'use client'` component taking an optional `count` prop; the cart-state phase edits only this file's internals to read from the cart store — `Nav.tsx` itself is never touched for that purpose.
- **Named spacing tokens, not raw arbitrary values:** `gutter`, `margin-mobile`/`margin-desktop`, `section-mobile`/`section-desktop` (from `stitch/DESIGN.md`'s scale) are defined once in `@theme` and used via `p-*`/`gap-*`/`m-*` utilities (e.g. `px-margin-mobile md:px-margin-desktop`). Do not hand-write pixel/rem spacing values in page components.
- **No icon library.** Hamburger/search/bag/WhatsApp icons are small inline SVGs (thin 1.5px stroke) — do not add `react-icons`, `lucide-react`, etc.
- **Repo hygiene fixed in this phase:** `.next/` and `node_modules/` were accidentally committed in the initial scaffold and are now untracked and gitignored, along with `.env*.local`, `next-env.d.ts`, and `.vercel`.

Established in `infra/02-data-layer-setup`:

- **Multiple root layouts.** The app has two independent roots: `app/(storefront)/layout.tsx` (the original root — announcement bar, `Nav`, `Footer`, fonts) and `app/(studio)/layout.tsx` (bare `<html>`/`<body>`, nothing else). A single shared root layout can't let a child route opt out of what it renders, so this was the only way to make `/studio` genuinely standalone. Any future route needing different top-level chrome follows this same pattern rather than adding conditionals to an existing root layout.
- **Never import `sanity.config.ts` from a Server Component.** Turbopack traces a Server Component's whole import graph for RSC bundling, and `sanity`'s internal code imports a client-only `swr` hook that breaks under that trace. `components/studio/StudioClient.tsx` (`'use client'`) is the only place that imports it.
- **Prisma 7 requires a driver adapter — there is no adapter-free `PrismaClient` for Postgres.** `lib/prisma.ts` uses `@prisma/adapter-pg` + `pg` (the standard adapter — not `@prisma/adapter-neon`, which is Neon's specialized edge/WebSocket driver and is not used here). `new PrismaClient()` with no adapter throws.
- **Connection URLs live in `prisma.config.ts`, not `schema.prisma`.** `schema.prisma`'s `datasource db` block only declares `provider = "postgresql"`. The pooled/direct split: `prisma.config.ts`'s `datasource.url` reads `DIRECT_URL` (CLI/migrations only), `lib/prisma.ts`'s adapter reads `DATABASE_URL` (pooled, app runtime).
- **Standalone scripts must load `.env.local` themselves.** Next's `dev`/`build`/`start` auto-load it; nothing else does. `prisma.config.ts` and `scripts/seed.ts` both call dotenv's `config({ path: ".env.local" })` explicitly — plain `import "dotenv/config"` only loads `.env`, which this project doesn't have.
- **Sanity has two datasets: `development` and `production`.** Sample/seed content (`scripts/seed.ts`) only ever targets `development` — the script hard-refuses to run against anything else. Local dev points `NEXT_PUBLIC_SANITY_DATASET` at `development`; going live means pointing it at `production` (which starts empty and is populated by the real store owners in Studio, not by the seed script).
- **Order numbers are `ZR-YYMMDD-XXXX`** (e.g. `ZR-260803-K7QF`), generated by `lib/orders.ts`'s `generateOrderNumber()` *before* insert — not derived from the database id, so it never reveals total order count. The `orderNumber` column has a unique constraint; callers must catch a collision and retry (up to 3 times) rather than assume uniqueness.
- **Sanity ISR window is fixed at 60 seconds** across every query in `lib/sanity/queries.ts` — don't vary this per query or per page.
- **`prisma init` also installs AI-agent skill docs** (`.claude/skills/`, `.agents/skills/`, `.windsurf/skills/`, `skills-lock.json` — ~90 files, three copies of the same Prisma reference docs). These are gitignored, not committed — they're useful locally but not app code, and the duplication across three tool-specific dirs would dominate any diff that touched them.

Established in `frontend/01-home-page`:

- **`components/home/` vs `components/ui/`.** Page-specific composition (`Hero.tsx`, `InstagramStrip.tsx` — not reused elsewhere) lives in `components/home/`; shared, reusable primitives (`ProductCard.tsx`, `SectionHeading.tsx`, `CategoryTile.tsx`, `TrustStrip.tsx`) live in `components/ui/` alongside `infra/01`'s `Button`/`ProductImage`. Later phases import the `ui/` set rather than redefining equivalents; a page's own one-off sections go in its own `components/<page>/` directory instead.
- **`lib/sanity/image.ts`'s `urlForImage` is the one Sanity-image-to-URL bridge.** `ProductImage` (from `infra/01`) takes a plain `src: string`, but Sanity returns image reference objects — `urlForImage` (wrapping the already-installed `@sanity/image-url`) converts one to the other and is `server-only`. Any component rendering a Sanity image imports this rather than instantiating its own `imageUrlBuilder`.
- **`lib/format.ts`'s `formatPrice` is the one price-formatting primitive.** Every later phase displaying a price (cart lines, order summary, confirmation) imports it instead of writing its own `"Rs. "` string concatenation. Price *presentation* (which price is primary, strikethrough, `SALE` badge) is a separate decision owned by `ProductCard`, not by `formatPrice` itself.
- **Query consolidation pattern for multi-item static content.** `listCategoryPreviews()` (added to `lib/sanity/queries.ts`) returns all four category tiles' preview products in a single GROQ round trip (one query with four keyed sub-queries) rather than four separate `listProductsByCategory` calls. Any future page needing several small, similarly-shaped Sanity results should follow this shape instead of issuing one fetch per item.
- **Category tile and product-card imagery are documented placeholders, not schema-driven features.** Tile images derive from the most recent product in that category (`listCategoryPreviews`); there's no dedicated category-hero-image field yet. A future phase adding real category photography replaces this rather than assuming today's behavior is intentional.
- **"Sale" and "New" badges are presentation-only, never stored fields.** `ProductCard` computes `onSale` from `salePrice != null && salePrice < price` at render time; `highlightNew` is a boolean the *calling page* passes in (e.g. the first `New Arrivals` result), not a Sanity field. Do not add a `isNew`/`isOnSale` field to the product schema to replace this.

Established in `frontend/02-category-listing-page`:

- **`FilterChips` is a category switcher, not a subcategory facet filter.** The visual design references subcategory chips (Earrings, Necklaces...) that have no backing field in the v1 product schema, and adding that taxonomy is out of scope. The chips row (All/Dresses/Perfumes/Beauty/Jewellery) instead switches category via plain `Link`s and stays on every category page, including single-category ones — it never disappears or gets hidden. If a subcategory field is ever added to the schema, it belongs in this row and the category switcher moves to a different affordance (e.g. into the breadcrumb).
- **Listing sort/filter/pagination state lives entirely in the URL, never in client state.** `/category/[slug]` reads `?sort=` and `?limit=` as `searchParams` and re-fetches server-side on every change. `SortDropdown` is the *only* `'use client'` file this phase added (a small leaf that pushes a new route on `onChange`); `FilterChips`, `ProductGrid`, "Load more", and the page itself are all Server Components. Any future listing-style UI (search, additional facets) should extend the same URL-param pattern rather than introducing client-side filter state.
- **Price sorting always uses the *effective* price.** `listCategoryProducts`'s GROQ `order()` clause sorts on `coalesce(salePrice, price)`, not the base `price` — a discounted item sorts by what the customer actually pays. Any future price-sort/price-filter feature must use the same `coalesce()` pattern, not just `price`.
- **"Load more" is a link, not a fetch.** It's a plain `<Link>` to the same route with `?limit=` incremented by 12 (`PRODUCTS_PER_PAGE`), re-running the full query server-side and slicing the result — no `IntersectionObserver`, no client-side accumulation of pages. `listCategoryProducts` itself has no server-side pagination; it fetches the full matching set in one query and the page slices it, an explicitly documented bounded-catalog assumption (fine at boutique scale — revisit if the catalog ever reaches the thousands).
- **Category header copy (`CATEGORY_META`) is a static local map, not Sanity-managed**, same placeholder pattern as `frontend/01`'s category-tile imagery — there's no Sanity category document/description field in the v1 schema.
- **Known dangling nav link:** `infra/01`'s `Nav` links to `/category/sale`, which 404s under this phase's routing (only the four real categories + `all` are valid slugs) — there is no "on sale" facet or page currently planned to own that route. Needs a decision (remove the link, or add a sale view) before launch.

---

## Constraints

- Every colour must come from a Tailwind token. Zero hardcoded hex values outside `tailwind.config.ts`.
- Pages are server components by default. Add `'use client'` only to genuinely interactive leaf components (cart, quantity stepper, filter chips, mobile menu).
- No external image hotlinking — Sanity CDN or local assets only.
- Phone numbers are Pakistani format; city and province are dropdowns of Pakistani options, not free text.
- Prices display as `Rs. 1,850` with comma separators.
- The site must be usable on a mid-range Android phone on 3G.

---

## Out of Scope for v1

Do not build, and do not design around building later:

- User accounts, login, signup, password reset
- Online payment gateway — Stripe is unavailable in Pakistan; COD plus manual bank transfer only
- Custom admin dashboard — Sanity Studio is the admin
- Product reviews and ratings
- Wishlist or favourites
- Site search
- Coupons or discount codes
- Email or SMS notifications
- Order tracking or order history
- Multi-currency or internationalisation
- Animation libraries (Framer Motion, GSAP) — CSS transitions only

---

## Success Criteria

- All seven pages match the designs in `stitch/` on both mobile and desktop
- A customer can complete the full flow from home page to placed order without an account
- Orders persist to Postgres and are retrievable by order number
- The owner can add a product in Sanity Studio and see it live without a deploy
- Zero hardcoded hex colours outside `tailwind.config.ts`
- Lighthouse mobile performance score of 85 or above

---

## Resolved Decisions

- **Fonts:** EB Garamond (headings) / Plus Jakarta Sans (body) — confirmed. The Cormorant Garamond / Jost pair mentioned earlier in requirements.md was outdated and is superseded by this entry.
- **Stitch folders:** flattened to one folder per page (see Design System → Visual references). The old nested `stitch_premium_eastern_boutique/<descriptive-name>/` layout no longer exists on disk.
- **Our Story:** in scope as page 7 (`/our-story`), static content, no backend calls, lowest priority — build last.
- **Colors:** the `colors:` block in `stitch/DESIGN.md` is ignored entirely; only the six tokens in Design System are used anywhere in the codebase. DESIGN.md's typography, spacing, shape, and component specs are otherwise authoritative.
- **Brand name:** `ZARIYA` (placeholder; domain not finalised).
- **Delivery charge:** flat `Rs. 250`, free above `Rs. 3,000`.
- **Product variants:** not in v1 — size/volume differences are handled as separate products.

No open questions remain blocking `/sc.plan`.
