"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useCart } from "@/lib/cart/useCart";
import { formatPrice } from "@/lib/format";
import { calculateDeliveryCharge } from "@/lib/delivery";
import { PAKISTANI_CITIES } from "@/lib/checkout/cities";
import { createOrder, type CheckoutFormState } from "./actions";

const INITIAL_STATE: CheckoutFormState = { errors: {} };

/**
 * The entire page is 'use client', same reasoning as frontend/05's cart
 * page: the order summary depends entirely on live cart state, and this
 * page is hydration-gated the same way (renders the empty view until
 * hasHydrated) to avoid a mismatch.
 */
export default function CheckoutPage() {
  const { items, hasHydrated, subtotal } = useCart();
  const createOrderWithItems = createOrder.bind(null, items);
  const [state, formAction, isPending] = useActionState(createOrderWithItems, INITIAL_STATE);

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
    <div className="px-margin-mobile py-section-mobile md:px-margin-desktop md:py-section-desktop">
      <h1 className="font-heading text-display-lg-mobile text-charcoal md:text-display-lg">
        Checkout
      </h1>

      <form
        action={formAction}
        className="mt-8 grid grid-cols-1 gap-gutter md:grid-cols-3 md:gap-16"
      >
        <div className="flex flex-col gap-10 md:col-span-2">
          <section>
            <h2 className="text-label-caps text-maroon">01 Contact Information</h2>
            <div className="mt-4 grid grid-cols-1 gap-gutter md:grid-cols-2">
              <div>
                <label htmlFor="customerName" className="text-label-caps text-charcoal">
                  Full Name
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  className="mt-2 w-full border border-line px-3 py-3 text-body-md text-charcoal"
                />
                {state.errors.customerName && (
                  <p className="mt-1 text-body-md text-maroon">{state.errors.customerName}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="text-label-caps text-charcoal">
                  Phone Number
                </label>
                <div className="mt-2 flex">
                  <span className="flex items-center border border-r-0 border-line px-3 text-body-md text-charcoal">
                    +92
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="300 1234567"
                    className="w-full border border-line px-3 py-3 text-body-md text-charcoal"
                  />
                </div>
                {state.errors.phone && (
                  <p className="mt-1 text-body-md text-maroon">{state.errors.phone}</p>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-label-caps text-maroon">02 Delivery Address</h2>
            <div className="mt-4 flex flex-col gap-gutter">
              <div>
                <label htmlFor="address" className="text-label-caps text-charcoal">
                  Complete Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="House number, street name, area"
                  className="mt-2 w-full border border-line px-3 py-3 text-body-md text-charcoal"
                />
                {state.errors.address && (
                  <p className="mt-1 text-body-md text-maroon">{state.errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                <div>
                  <label htmlFor="city" className="text-label-caps text-charcoal">
                    City
                  </label>
                  <select
                    id="city"
                    name="city"
                    defaultValue=""
                    className="mt-2 w-full border border-line bg-white px-3 py-3 text-body-md text-charcoal"
                  >
                    <option value="" disabled>
                      Select a city
                    </option>
                    {PAKISTANI_CITIES.map(({ city }) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {state.errors.city && (
                    <p className="mt-1 text-body-md text-maroon">{state.errors.city}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="landmark" className="text-label-caps text-charcoal">
                    Landmark (Optional)
                  </label>
                  <input
                    id="landmark"
                    name="landmark"
                    type="text"
                    placeholder="e.g. Near Main Mosque"
                    className="mt-2 w-full border border-line px-3 py-3 text-body-md text-charcoal"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-label-caps text-maroon">03 Payment Method</h2>
            <div className="mt-4 flex flex-col gap-3">
              <label className="flex cursor-pointer items-start gap-3 border border-line p-4 has-checked:border-charcoal">
                <input type="radio" name="paymentMethod" value="cod" defaultChecked className="mt-1" />
                <span>
                  <span className="block text-body-md text-charcoal">Cash on Delivery</span>
                  <span className="block text-label-caps text-charcoal/60">
                    Pay in cash when your order arrives.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 border border-line p-4 has-checked:border-charcoal">
                <input type="radio" name="paymentMethod" value="bank_transfer" className="mt-1" />
                <span>
                  <span className="block text-body-md text-charcoal">
                    Bank Transfer / JazzCash / Easypaisa
                  </span>
                  <span className="block text-label-caps text-charcoal/60">
                    We will share account details on WhatsApp once you place the order.
                  </span>
                </span>
              </label>
              {state.errors.paymentMethod && (
                <p className="text-body-md text-maroon">{state.errors.paymentMethod}</p>
              )}
            </div>

            <div className="mt-6">
              <label htmlFor="notes" className="text-label-caps text-charcoal">
                Order Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Special instructions for delivery..."
                className="mt-2 w-full border border-line px-3 py-3 text-body-md text-charcoal"
              />
            </div>
          </section>
        </div>

        <div className="h-fit bg-blush p-6">
          <h2 className="font-heading text-headline-md-mobile text-charcoal">Order Summary</h2>

          <div className="mt-6 flex flex-col gap-4">
            {items.map((item) => (
              <div key={item.slug} className="flex gap-3">
                <div className="w-16 flex-shrink-0">
                  <ProductImage src={item.image} alt={item.name} />
                </div>
                <div className="flex-1">
                  <p className="text-body-md text-charcoal">{item.name}</p>
                  <p className="text-label-caps text-charcoal/60">Qty: {item.quantity}</p>
                  <p className="text-price-tag text-maroon">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-between border-t border-line pt-6 text-body-md text-charcoal">
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

          {state.formError && (
            <p className="mt-4 text-body-md text-maroon">{state.formError}</p>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={isPending} className="w-full disabled:opacity-50">
              {isPending ? "Placing Order..." : `Place Order — ${formatPrice(total)}`}
            </Button>
          </div>

          <p className="mt-4 text-label-caps text-charcoal/60">
            You pay when your order arrives. We will confirm your order on WhatsApp.
          </p>
        </div>
      </form>
    </div>
  );
}
