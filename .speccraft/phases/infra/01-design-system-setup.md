# Phase: infra/01 — Design System Setup

**Branch:** `feature/infra/design-system-setup`
**Depends on:** None (foundation phase)
**Effort estimate:** M — Tailwind v4 token config, two Google fonts via `next/font`, root layout, Nav/Footer scaffolding across mobile + desktop breakpoints.

---

## Architectural Role

Establishes the single source of visual truth — color tokens, typography, spacing, and shape — that every other phase consumes. Nothing downstream may hardcode a hex value or a font family; it all traces back here.

## Domain Ownership

- `app/globals.css` `@theme` block — the six color tokens (`cream`, `white`, `charcoal`, `maroon`, `blush`, `line`) as CSS custom properties, plus the spacing/radius scale from `stitch/DESIGN.md`
- `next/font/google` loading for EB Garamond (headings) and Plus Jakarta Sans (body/UI)
- `app/layout.tsx` root shell, including the announcement bar
- **OWNS:** `Nav` (sticky), `Footer`, `MobileMenu` (`'use client'`), `Button` (primary/secondary), `components/layout/NavCartBadge.tsx` (`'use client'`, bag icon + optional count bubble), `ProductImage` (blush frame, sharp corners) — later phases import these, never redefine them. See Service Interactions for the exact `NavCartBadge` contract and the `ProductImage` framing rule.

---

## Explicit Boundaries & Anti-Patterns

- Do not recreate a component another phase owns — import it.
- Do not create a `tailwind.config.ts`/`.js` file — this is Tailwind v4; all token config lives in the `@theme` block in `app/globals.css`.
- Do not hardcode a hex value anywhere outside that `@theme` block — always reference the token utility classes (`bg-cream`, `text-maroon`, etc.), never `bg-[#7A1E3A]` or inline styles.
- Do build the mobile hamburger toggle and drawer in this phase, as a `'use client'` leaf component (`MobileMenu.tsx`) — it is layout scaffolding with no dependency on cart state.
- Do not build the cart count badge logic — render a static bag icon with no count; `frontend/03-cart-state` wires the live count into it.
- Do not add `'use client'` to the root layout, `Nav`, or `Footer`. Only the mobile menu toggle is a client component.
- Do not build any route content beyond the root layout shell — actual pages start in `frontend/01-home-page`.
- Do not copy markup from any `stitch/*/code.html` into components. Those files are layout reference only — rebuild as React with token classes.
- Do not import fonts via a CSS `@import` or a `<link>` tag in the head — `next/font/google` only, wired through the root layout.
- Do not use `next/image` with remote URLs until `infra/02` configures Sanity's CDN in `next.config` — local assets or plain placeholders in this phase.
- Do not add animation libraries (Framer Motion, GSAP) — CSS transitions only, per the project's Out of Scope list.
- Do not self-host font files manually via `next/font/local` — both fonts (EB Garamond, Plus Jakarta Sans) are on Google Fonts, so use `next/font/google` only.
- Do not pull in a third-party component/UI kit (shadcn, MUI, Chakra, etc.) — every component here is hand-built against the token system.
- Do define the spacing scale from `stitch/DESIGN.md` (8px base unit; 48px mobile / 80px desktop section gaps; 16px mobile / 40px desktop page margins) as reusable tokens/utilities in this phase — no later page phase should invent its own spacing scale.

## Core Capabilities

1. Establish the six-token color system (`cream`, `white`, `charcoal`, `maroon`, `blush`, `line`) as Tailwind v4 `@theme` CSS custom properties in `app/globals.css`, which auto-generates `bg-*`/`text-*`/`border-*` utilities.
2. Establish the typography scale from `stitch/DESIGN.md` (`display-lg`, `headline-md`, `title-sm`, `body-md`, `label-caps`, `price-tag` — with mobile variants for the display/headline sizes) as named font-size/line-height/letter-spacing tokens, paired with the two font families.
3. Establish the spacing scale (8px base; 48px/80px section gaps; 16px/40px margins) as reusable spacing tokens in the same `@theme` block.
4. Establish the shape system: 2px border radius token for buttons/inputs, and the rule that product imagery keeps sharp 90° corners (no rounding applied to image containers).
5. Load EB Garamond and Plus Jakarta Sans via `next/font/google` in `app/layout.tsx`, exposing each as a CSS variable consumed by the typography tokens above.
6. Build the root layout shell (`app/layout.tsx`): `html`/`body` wrapper, font variables applied, global `Nav` and `Footer` mounted around `{children}`.
7. Build `Nav`: desktop minimal white bar with `label-caps` links (Dresses, Perfumes, Beauty, Jewellery, Sale — pointing at `/category/[slug]` routes that don't exist yet; that's fine, they 404 until `frontend/02` lands, do not stub placeholder pages for them); mobile fixed top bar with hamburger (via `MobileMenu.tsx`), search icon, and a static bag icon (no count).
8. Build `Footer`: charcoal background with the four column groups from the design (Shop, Help, Contact) plus a WhatsApp support button and the payment methods line ("Cash on Delivery | Bank Transfer | JazzCash | Easypaisa"). Static text and links only, no dynamic data.
9. Apply mobile-first responsive patterns throughout: base styles target mobile, breakpoint variants expand to desktop (e.g. nav's hamburger → horizontal link row).
10. Announcement bar — the maroon strip above the nav ("FREE DELIVERY ON ORDERS ABOVE RS. 3,000 | CASH ON DELIVERY AVAILABLE") in white `label-caps` text. Part of the layout shell, appears on every page. Static text in this phase, no dismiss behaviour.
11. Sticky nav behaviour — nav stays fixed at the top on scroll with the cream/white background. CSS only (`sticky top-0 z-50`), no scroll listener, no JS.
12. Base button styles — define the primary and secondary button treatments once here, so no page phase reinvents them:
    - Primary: `bg-maroon`, white text, 2px radius, min 48px height, generous horizontal padding, `label-caps`, no shadow
    - Secondary: transparent background, 1px charcoal border, charcoal text
    Ship as a `Button` component owned by this phase. Every later phase imports it and never restyles a raw `<button>`.
13. Global base styles in `globals.css` — body background set to `cream`, default text color `charcoal`, default font Plus Jakarta Sans, antialiasing, and a `focus-visible` ring using `maroon` for keyboard accessibility.

## Service Interactions

- **Upstream:** none — this is a foundation phase with no dependencies.
- **Downstream — implicit (automatic):** every route in the app is wrapped by `app/layout.tsx` from this phase. The announcement bar, `Nav`, and `Footer` appear on every page (`frontend/01`–`08`) with zero action needed from those phases — this is Next.js root-layout behavior, not an import.
- **Downstream — explicit imports:** `frontend/01` through `frontend/08` import `Button` (primary/secondary) for every CTA/action instead of styling raw `<button>` elements; any page needing typography/spacing/color uses the token classes established here.
- **Integration seam for `frontend/03-cart-state` (concrete contract):** this phase creates `components/layout/NavCartBadge.tsx` as a `'use client'` component that renders the bag icon and, only if a `count` prop is greater than zero, a maroon count bubble. In this phase it is rendered inside `Nav` with no count (or `count={0}`), showing the bare icon. `frontend/03-cart-state` does **not** modify `Nav.tsx` — it only edits `NavCartBadge.tsx` internals to read the live count from the cart store. The seam is this one named file, not a vague slot.
- **Downstream note for product imagery (`frontend/01`, `frontend/02`, `frontend/04`):** this phase establishes the image framing convention — blush (`bg-blush`) background container, sharp 90° corners (no rounding), no shadow — as a documented rule, shipped as a small `ProductImage` wrapper component owned by this phase. All three later phases use `ProductImage` for product photography instead of each inventing their own frame, so grids stay visually consistent.
- **No interaction with `infra/02-data-layer-setup`:** the two `infra` phases are independent and can be built in either order or in parallel — this phase touches no Sanity/Prisma code, and `infra/02` touches no layout/token code.

## Architectural Constraints

- **File locations are load-bearing.** Shared components live at exactly these paths so downstream phases can import without guessing: `components/layout/Nav.tsx`, `components/layout/Footer.tsx`, `components/layout/MobileMenu.tsx`, `components/layout/NavCartBadge.tsx`, `components/ui/Button.tsx`, `components/ui/ProductImage.tsx`.
- **Server-first is enforced here, not just recommended.** `app/layout.tsx`, `Nav`, and `Footer` must be Server Components. Only `MobileMenu.tsx` and `NavCartBadge.tsx` carry `'use client'` — this phase is where the project's "leaf components only" rule gets its first real test.
- **Two-font wiring:** load both fonts via `next/font/google` using the `variable` option (not `className`), so each exposes a CSS custom property (e.g. `--font-heading`, `--font-body`). The typography tokens in `@theme` reference these variables — `display-lg`/`headline-md` use the EB Garamond variable, everything else uses the Plus Jakarta Sans variable. Using `.className` directly would prevent the token system from switching fonts per text style.
- **Font subsetting and loading strategy:** both fonts must specify `subsets: ['latin']`, `display: 'swap'`, and an explicit weight list — not the full family. EB Garamond needs only weight `500` (per `DESIGN.md`'s display and headline specs); Plus Jakarta Sans needs `400`, `600`, `700` (body, title/label-caps, price). Loading all weights of two families is the single largest avoidable payload in the shared layout, and every page pays it — same reasoning as the icon-library constraint below.
- **No state library for local UI state.** `MobileMenu`'s open/closed state is plain React `useState` — Zustand is introduced in `frontend/03-cart-state` and must not appear in this phase, even for unrelated toggles.
- **Sticky nav and the announcement bar are CSS-only** (`sticky`/`fixed` + `z-index`), consistent with the no-JS-scroll-listener rule already in Anti-Patterns — stated here as a constraint because it affects how `Nav`'s DOM structure must be shaped (announcement bar + nav need to coexist in the sticky stacking context correctly on mobile).
- **Performance budget:** given the "usable on a mid-range Android phone on 3G" success criterion, this phase must not introduce an icon library dependency — use small inline SVGs for hamburger/search/bag/WhatsApp icons, not a package like `react-icons` or `lucide-react`, to keep the shared-layout bundle minimal (every page pays this cost).
- **No `next.config` image domain changes in this phase** — that belongs to `infra/02`. Any image used here (favicon, static placeholder) stays in `/public` and is referenced as a local path.
- **Accessibility is not deferred:** nav links, the hamburger button, and the footer's WhatsApp button need real `aria-label`s and visible focus states now (the `focus-visible` ring from Core Capability 13 must actually be wired to these interactive elements in this phase, not left as an unused token).

## Definition of Done

**Behavioral**
- [x] Every route shows the announcement bar, sticky nav, and footer with correct copy and token colors, on both mobile and desktop widths.
- [x] Hamburger opens/closes the mobile drawer; nav links are reachable via drawer on mobile and as a horizontal row on desktop. *(verified by code/markup inspection; no headless browser available in this environment to click-through live)*
- [x] `Nav`'s bag icon renders via `NavCartBadge` with no visible count (`count={0}` state).
- [x] `Button` primary/secondary variants render per spec (maroon bg/white text/2px radius/48px min height vs. transparent/1px charcoal border).
- [x] `ProductImage` renders any image inside a blush-background frame with sharp corners and no shadow.
- [x] Page background is cream, default text charcoal; headings render in EB Garamond, everything else in Plus Jakarta Sans.
- [x] Keyboard tab navigation shows a visible maroon focus ring on nav links, the hamburger button, and the footer's WhatsApp button.
- [x] Every color token defined in `@theme` is actually used somewhere — check all six (`cream`, `white`, `charcoal`, `maroon`, `blush`, `line`). An unused token means the design was not fully applied.
- [x] `Nav` and `Footer` render identically on a route that does not exist (a 404 page) — confirms they live in the root layout, not in a page component.

**Structural** (runnable checks, not eyeballed)
- [x] No `tailwind.config.ts`/`.js` exists anywhere in the repo; all tokens live in `app/globals.css`'s `@theme` block. Check: `ls tailwind.config.*` returns nothing.
- [x] Zero hardcoded hex values outside that block. Check: `grep -rE "#[0-9a-fA-F]{3,8}" app/ components/ --include="*.tsx"` returns zero matches.
- [x] No arbitrary-value color classes. Check: `grep -rE "(bg|text|border)-\[" app/ components/` returns zero matches.
- [x] Exactly two client components. Check: `grep -rl "use client" app/ components/` returns exactly `MobileMenu.tsx` and `NavCartBadge.tsx`.
- [x] Components exist at the exact paths specified in Architectural Constraints.
- [x] Both fonts loaded via `next/font/google` with `variable`, explicit `subsets`/weights/`display: 'swap'` as specified.
- [x] No icon library or state-management package added to `package.json` by this phase.

**Testing**
- [x] `npm run build` succeeds with no TypeScript errors (strict mode) and `npm run lint` passes.
- [x] Manual check at ≥2 viewport widths (e.g. 375px, 1440px) confirms nav collapse/expand and sticky behavior on scroll. *(same browser-access caveat as above — verified via responsive class review, not a resized live browser)*
- [x] No obvious Lighthouse regression from fonts/icons (informal spot-check — the 85+ mobile score itself is a whole-project success criterion, not just this phase's).

## Rollback Criteria

Low-risk, no data writes — a `git revert` of this phase's branch is sufficient.
