"use client";

import { Button } from "@/components/ui/Button";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { useCart } from "@/lib/cart/useCart";
import { formatPrice } from "@/lib/format";
import { calculateDeliveryCharge } from "@/lib/delivery";

/**
 * The whole page is 'use client', not split into a Server Component shell —
 * there is no server data here at all. Every meaningful piece of content
 * (the item count, the empty/populated branch, every order-summary number)
 * depends on live cart state; splitting would only move a few trivial
 * static strings out of the client bundle while ProductImage/QuantityStepper/
 * Button/the cart-reading logic all stay client regardless. Before hydration
 * completes, this renders the same empty view the server saw (matching
 * NavCartBadge's approach) to avoid a hydration mismatch — the tradeoff is a
 * brief empty-state flash on reload for a non-empty cart, accepted as-is.
 */
export default function CartPage() {
  const { items, hasHydrated, subtotal, updateQuantity, removeItem } = useCart();

  const showEmpty = !hasHydrated || items.length === 0;

  if (showEmpty) {
    return (
      <div className="flex flex-col items-center gap-6 px-margin-mobile py-section-mobile text-center md:px-margin-desktop md:py-section-desktop">
        <p className="text-body-md text-charcoal">Your cart is empty.</p>
        <Button href="/">Continue Shopping</Button>
      </div>
    );
  }

  const deliveryCharge = calculateDeliveryCharge(subtotal);
  const total = subtotal + deliveryCharge;

  return (
    <div className="grid grid-cols-1 gap-gutter px-margin-mobile py-section-mobile md:grid-cols-3 md:gap-16 md:px-margin-desktop md:py-section-desktop">
      <div className="md:col-span-2">
        <h1 className="font-heading text-display-lg-mobile text-charcoal md:text-display-lg">
          Your cart ({items.length} {items.length === 1 ? "item" : "items"})
        </h1>

        <div className="mt-8">
          {items.map((item) => (
            <CartLineItem
              key={item.slug}
              item={item}
              onUpdateQuantity={(quantity) => updateQuantity(item.slug, quantity)}
              onRemove={() => removeItem(item.slug)}
            />
          ))}
        </div>
      </div>

      <div className="h-fit bg-blush p-6">
        <h2 className="font-heading text-headline-md-mobile text-charcoal">Order Summary</h2>

        <div className="mt-6 flex justify-between text-body-md text-charcoal">
          <p>Subtotal</p>
          <p>{formatPrice(subtotal)}</p>
        </div>

        <div className="mt-3 flex justify-between text-body-md text-charcoal">
          <p>Delivery</p>
          <p>{deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)}</p>
        </div>

        <div className="mt-6 flex justify-between border-t border-line pt-6 text-price-tag">
          <p className="text-charcoal">Total</p>
          <p className="text-maroon">{formatPrice(total)}</p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button href="/checkout">Proceed to Checkout</Button>
          <Button variant="secondary" href="/">
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}
