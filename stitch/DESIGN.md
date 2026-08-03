---
name: Heritage Minimalist
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#554245'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#887175'
  outline-variant: '#dbc0c4'
  surface-tint: '#a03b56'
  primary: '#5c0325'
  on-primary: '#ffffff'
  primary-container: '#7a1e3a'
  on-primary-container: '#ff8aa4'
  inverse-primary: '#ffb1c0'
  secondary: '#605e5f'
  on-secondary: '#ffffff'
  secondary-container: '#e6e1e2'
  on-secondary-container: '#666465'
  tertiary: '#2e2b2d'
  on-tertiary: '#ffffff'
  tertiary-container: '#444143'
  on-tertiary-container: '#b3adaf'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#ffb1c0'
  on-primary-fixed: '#3f0016'
  on-primary-fixed-variant: '#81233f'
  secondary-fixed: '#e6e1e2'
  secondary-fixed-dim: '#cac5c6'
  on-secondary-fixed: '#1c1b1c'
  on-secondary-fixed-variant: '#484647'
  tertiary-fixed: '#e8e1e3'
  tertiary-fixed-dim: '#cbc5c7'
  on-tertiary-fixed: '#1d1b1c'
  on-tertiary-fixed-variant: '#494648'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md-mobile:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.2'
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.5'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.15em
  price-tag:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  section-gap-desktop: 80px
  section-gap-mobile: 48px
  grid-margin-desktop: 40px
  grid-margin-mobile: 16px
  gutter: 16px
---

## Brand & Style

The design system is anchored in a "New Heritage" aesthetic—a fusion of traditional Pakistani elegance and contemporary minimalist commerce. The brand personality is poised, sophisticated, and premium, targeting a discerning audience that values both cultural roots and modern simplicity. 

The visual style follows **Minimalism** with a focus on high-quality editorial layouts. It utilizes generous whitespace to let product photography breathe, avoiding any unnecessary ornamentation. The interface relies on flat design principles, precision alignment, and a refined typographic hierarchy to evoke a sense of luxury and calm.

## Colors

The palette is restrained and intentional, designed to highlight product vibrancy.

- **Primary (Maroon):** Reserved for high-intent actions, active states, price points, and exclusive badges.
- **Secondary (Blush):** Used as a soft surface color for section backgrounds, image placeholders, and secondary containers to provide a gentle contrast against pure white.
- **Background (Pure White):** The primary canvas for the entire experience, ensuring a clean, high-end gallery feel.
- **Text (Charcoal):** Provides high legibility without the harshness of pure black, maintaining a soft premium look.
- **Dividers (Hairline):** Used for subtle structural separation.

## Typography

This design system employs a dual-typeface strategy to balance tradition and utility.

- **Headlines:** Uses a sophisticated Serif font for large displays and titles. It brings a literary and artisanal quality to the brand.
- **Body & UI:** Uses a clean, geometric Sans-Serif for all functional text, ensuring maximum readability on mobile devices.
- **Labeling:** All small tags, category labels, and utility links use uppercase sans-serif with increased letter spacing to create a distinct "designer" look.
- **Scaling:** Large display headings should scale down significantly on mobile to maintain vertical rhythm without overwhelming the viewport.

## Layout & Spacing

The layout is built on a **Fluid Grid** model with a mobile-first philosophy.

- **Grid:** Use a 12-column grid for desktop and a 2-column or 4-column grid for mobile.
- **Margins:** Large margins on desktop (40px+) create a "lookbook" feel, while mobile margins are kept at 16px to maximize screen real estate for product imagery.
- **Rhythm:** Vertical spacing between sections should be generous (48px - 80px) to prevent the UI from feeling cluttered.
- **Alignment:** Content is generally center-aligned or left-aligned for an editorial feel. Navigation items are left-aligned with a centered logo for a classic retail structure.

## Elevation & Depth

This design system eschews shadows and blurs in favor of **Tonal Layers** and **Low-contrast Outlines**.

- **Depth:** Depth is communicated through color blocking rather than shadows. Use the Blush (#F8F3F4) surface to distinguish sections or "containers" from the white background.
- **Borders:** Use Hairline (#EDE6E8) borders for input fields and structural dividers.
- **Flatness:** UI elements like buttons and cards must remain perfectly flat. Do not use gradients or drop shadows; the premium feel is derived from the precision of typography and spacing.

## Shapes

The shape language is sharp and architectural. 

- **Corner Radius:** A subtle 2px (Soft) radius is applied to buttons and input fields to prevent them from feeling "aggressive" while maintaining a crisp, formal look.
- **Product Imagery:** Images should maintain sharp 90-degree corners to mimic the look of a printed fashion magazine.
- **Icons:** Use thin-stroke (1px to 1.5px) linear icons to match the refined typography.

## Components

### Buttons
- **Primary:** Solid Maroon (#7A1E3A) background with White text. 2px border radius. No shadow.
- **Secondary:** Transparent background with a 1px Charcoal border.
- **Size:** Large touch targets (min 48px height) with generous horizontal padding.

### Product Cards
- **Structure:** Vertical orientation. 
- **Image:** High-resolution portrait shots placed on a Blush (#F8F3F4) background to create a "frame" effect.
- **Meta:** Title in Charcoal Sans-Serif, Price in Maroon Bold Sans-Serif. Minimal icons (e.g., a simple heart for wishlist).

### Navigation
- **Desktop:** Minimal white bar. Logo centered or left. Links in `label-caps` style.
- **Mobile:** Fixed top bar with a "Hamburger" menu, search icon, and bag icon. 

### Input Fields
- **Style:** 1px Hairline border on all sides or a simple bottom border only for a more minimal look. 
- **Focus State:** Border changes to Charcoal or Maroon.

### Badges & Chips
- **New/Sale Tags:** Small, rectangular tags with 0px or 2px radius. Maroon background for sales, Charcoal for new arrivals. Text in `label-caps` white.

### Lists & Carousels
- **Horizontal Scrollers:** Used on mobile for "Related Products" to maintain a clean vertical flow. No visible scrollbars.