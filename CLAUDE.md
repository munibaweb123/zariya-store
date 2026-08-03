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

- **Framework:** Next.js 15 (App Router), TypeScript strict mode
- **Styling:** Tailwind CSS — design tokens only, no arbitrary hex values in components
- **Content:** Sanity CMS for products (name, slug, price, salePrice, category, images, description, inStock, featured)
- **Database:** Neon Postgres with Prisma — orders only
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
<!-- Established during Phase 1 and updated by /sc.sync after each phase -->

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
