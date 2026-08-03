"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart/store";

type CartProviderProps = {
  children: React.ReactNode;
};

/**
 * Not a React Context — the cart store is already a plain Zustand hook.
 * This component's only job is the one-time localStorage rehydration on
 * mount (the store sets skipHydration so this is explicit, not automatic),
 * so the server and the first client render both start from an empty
 * cart and nothing reading cart state hits a hydration mismatch.
 *
 * Two corruption cases, verified directly against the store (see
 * lib/cart/store.ts): invalid JSON in localStorage is caught internally by
 * zustand's persist middleware and treated as "nothing stored" (no throw);
 * valid JSON with an unexpected shape is caught by the store's own `merge`
 * function instead. The try/catch below is a deliberate extra safety net
 * for either case reaching here some other way, not a sign either one is
 * known to throw today.
 */
export function CartProvider({ children }: CartProviderProps) {
  useEffect(() => {
    async function hydrate() {
      try {
        await useCartStore.persist.rehydrate();
      } catch {
        useCartStore.setState({ items: [] });
      } finally {
        useCartStore.setState({ hasHydrated: true });
      }
    }

    hydrate();
  }, []);

  return <>{children}</>;
}
