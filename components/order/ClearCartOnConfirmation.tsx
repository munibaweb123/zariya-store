"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart/useCart";

/**
 * Renders nothing — its only job is clearing the cart once this page
 * confirms an order was placed. Must wait for hasHydrated before clearing:
 * CartProvider's rehydrate() reads the pre-order cart back from localStorage
 * on mount, and if that finishes after an unconditional clear, it would
 * silently repopulate the cart with the old contents, undoing the clear.
 * Idempotent — a second visit (cart already empty) is a harmless no-op.
 */
export function ClearCartOnConfirmation() {
  const { hasHydrated, clearCart } = useCart();

  useEffect(() => {
    if (hasHydrated) {
      clearCart();
    }
  }, [hasHydrated, clearCart]);

  return null;
}
