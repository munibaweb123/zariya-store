# Branches

Branch naming convention: `<type>/<area>/<name>`. All branches below are `feature/...` off `develop`.

## infra

| # | Branch | Phase file | Depends on |
|---|---|---|---|
| 01 | `feature/infra/design-system-setup` | `.speccraft/phases/infra/01-design-system-setup.md` | None (foundation) |
| 02 | `feature/infra/data-layer-setup` | `.speccraft/phases/infra/02-data-layer-setup.md` | None (foundation) |

## frontend

| # | Branch | Phase file | Depends on |
|---|---|---|---|
| 01 | `feature/frontend/home-page` | `.speccraft/phases/frontend/01-home-page.md` | infra/01, infra/02 |
| 02 | `feature/frontend/category-listing-page` | `.speccraft/phases/frontend/02-category-listing-page.md` | infra/01, infra/02, frontend/01 |
| 03 | `feature/frontend/cart-state` | `.speccraft/phases/frontend/03-cart-state.md` | infra/01 |
| 04 | `feature/frontend/product-detail-page` | `.speccraft/phases/frontend/04-product-detail-page.md` | infra/01, infra/02, frontend/01, frontend/03 |
| 05 | `feature/frontend/cart-page` | `.speccraft/phases/frontend/05-cart-page.md` | frontend/03, frontend/04 |
| 06 | `feature/frontend/checkout-page` | `.speccraft/phases/frontend/06-checkout-page.md` | infra/02, frontend/03, frontend/05 |
| 07 | `feature/frontend/order-confirmation-page` | `.speccraft/phases/frontend/07-order-confirmation-page.md` | infra/02, frontend/04, frontend/06 |
| 08 | `feature/frontend/our-story-page` | `.speccraft/phases/frontend/08-our-story-page.md` | infra/01 |

## Build order

```
infra/01 ──┬─────────────────────────────────────────────────────────┐
           │                                                         │
infra/02 ──┴── frontend/01 ── frontend/02                            │
                    │                                                │
                    │         frontend/03 (cart-state, no page)      │
                    │              │                                 │
                    └──────────────┴── frontend/04 ── frontend/05 ── frontend/06 ── frontend/07
                                                                                          │
frontend/08 (build last, low priority, depends only on infra/01) ───────────────────────-┘ (independent)
```

## Shared-ownership map (must import, never redefine)

| Component / module | Owned by |
|---|---|
| `Nav`, `Footer`, `MobileMenu`, `Button`, `NavCartBadge`, `ProductImage` | infra/01 design-system-setup |
| `ProductCard`, `SectionHeading`, `CategoryTile`, `TrustStrip` | frontend/01 home-page |
| `FilterChips`, `SortDropdown`, `ProductGrid` | frontend/02 category-listing-page |
| Zustand cart store, `useCart`, `CartProvider`, cart nav badge | frontend/03 cart-state |
| `QuantityStepper`, `Accordion`, `ImageGallery`, `lib/whatsapp.ts` | frontend/04 product-detail-page |

Every phase file's Anti-Patterns section carries: *"Do not recreate a component another phase owns — import it."*
