# Requirements — Zeenat Storefront

## Product

An online storefront where Pakistani customers browse and order dresses, perfumes, beauty products, and handmade jewellery, with cash-on-delivery checkout confirmed over WhatsApp.

Run by two partners. Orders are fulfilled manually: the owner confirms on WhatsApp, ships via a local courier (TCS / Leopard / PostEx), and cash is collected on delivery.

---

## Users

**Primary — customers.** Pakistani women aged 18–35 shopping on mobile, who discover the brand through Instagram, expect cash on delivery, and prefer to confirm orders over WhatsApp rather than create an account.

**Secondary — store owners.** The two founders, who manage products, prices, images, and stock through Sanity Studio and confirm incoming orders on WhatsApp. They are not developers and must never need to touch code to add a product.

---

## Core User Flows

### 1. Browse and discover
Customer lands on the home page (often from an Instagram link) → taps a category tile or a bestseller card → filters the category listing → opens a product detail page with photos, price, and description.

### 2. Order with cash on delivery
Customer adds a product to the cart → adjusts quantity → opens the cart → proceeds to guest checkout → fills name, phone, address, city, province → selects Cash on Delivery → places the order. A server action validates the input and writes the order to Postgres, then the confirmation page shows an order number and a WhatsApp button pre-filled with the order details.

### 3. Manage the store
Owner adds or edits products, prices, sale prices, images, categories, and stock status in Sanity Studio. Changes appear on the storefront without a code deploy.

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

Non-negotiable. Define these in `tailwind.config.ts` as named tokens and reference them by class name everywhere.

| Token | Hex | Use |
|---|---|---|
| `white` | `#FFFFFF` | page background |
| `charcoal` | `#2B2B2B` | primary text, footer background |
| `maroon` | `#7A1E3A` | primary buttons, sale badges, category tags, prices |
| `blush` | `#F8F3F4` | alternating section backgrounds, image placeholders |
| `line` | `#EDE6E8` | hairline borders and dividers |

**Fonts:** Cormorant Garamond for headings (serif), Jost for body and buttons (sans). Loaded via `next/font/google`.

**Visual language:** Minimal premium, in the style of Khaadi or Sapphire. White-dominant pages where product photography carries the visual weight; maroon appears only on buttons, badges, tags, and prices. Generous whitespace, no drop shadows, no gradients, 2px border radius on buttons, uppercase letter-spaced small labels, hairline dividers instead of card borders.

**Responsiveness:** Mobile-first. Desktop is the same components at wider breakpoints — 2-column product grids become 4-column, stacked sections become 2-column, hamburger becomes horizontal nav.

**Visual references:** PNG exports of the approved designs are in `stitch/`. Match layout, spacing, and hierarchy to these.

---

## Pages

1. **Home** (`/`) — announcement bar, sticky nav, hero banner with one CTA, four category tiles, bestsellers grid, blush trust strip, new arrivals grid, Instagram strip, footer
2. **Category listing** (`/category/[slug]`) — breadcrumb, category header on blush band, product count and sort dropdown, filter chips, product grid, load more
3. **Product detail** (`/product/[slug]`) — image gallery with thumbnails, name, price with sale handling, short description, quantity stepper, add to cart, WhatsApp order button, accordion sections, related products
4. **Cart** (`/cart`) — line items with quantity steppers and remove links, order summary card, empty state
5. **Checkout** (`/checkout`) — guest only. Contact fields (name, phone), delivery address (address, city, province, optional landmark), payment method selector (COD default, bank transfer secondary), order notes, sticky order summary
6. **Order confirmation** (`/order/[orderNumber]`) — success state, order number, summary, delivery estimate, "Confirm on WhatsApp" button

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

## Constraints

- Every colour must come from a Tailwind token. Zero hardcoded hex values outside `tailwind.config.ts`.
- Pages are server components by default. Add `'use client'` only to genuinely interactive leaf components (cart, quantity stepper, filter chips, mobile menu).
- No external image hotlinking — Sanity CDN or local assets only.
- Phone numbers are Pakistani format; city and province are dropdowns of Pakistani options, not free text.
- Prices display as `Rs. 1,850` with comma separators.
- The site must be usable on a mid-range Android phone on 3G.

---

## Success Criteria

- All six pages match the designs in `stitch/` on both mobile and desktop
- A customer can complete the full flow from home page to placed order without an account
- Orders persist to Postgres and are retrievable by order number
- The owner can add a product in Sanity Studio and see it live without a deploy
- Zero hardcoded hex colours outside `tailwind.config.ts`
- Lighthouse mobile performance score of 85 or above

---

## Open Questions

- Brand name and domain not yet finalised — use `Zeenat` as a placeholder in copy and replace later
- Delivery charge: flat rate or free above a threshold? Assume flat `Rs. 250` with free delivery above `Rs. 3,000` until confirmed
- Whether product variants (size for dresses, volume for perfumes) are needed in v1 or can be handled as separate products

**Fonts:** EB Garamond (headings, serif), Plus Jakarta Sans (body/UI, sans) — via next/font/google
**Page background:** cream #FCF9F8. Pure white #FFFFFF for nav bar and cards.

**Design source of truth:** `stitch/DESIGN.md` — use its spacing scale (8px base,
48px mobile / 80px desktop section gaps, 16px mobile / 40px desktop margins),
typography scale, component specs, and shape rules.

IMPORTANT: Ignore the `colors:` block in stitch/DESIGN.md. It is an
auto-generated Material Design 3 palette with 45+ tokens. Use ONLY these six
tokens in tailwind.config.ts: cream #FCF9F8, white #FFFFFF, charcoal #2B2B2B,
maroon #7A1E3A, blush #F8F3F4, line #EDE6E8.

**Screen references:** each page's approved design is at `stitch/<page>/screen.png`,
with Stitch's generated markup at `stitch/<page>/code.html` for layout reference only —
do not copy that HTML into components, rebuild it as React with Tailwind tokens.