import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

type AddItemInput = Omit<CartItem, "quantity"> & { quantity?: number };

type CartState = {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: AddItemInput) => void;
  removeItem: (slug: string) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  setHasHydrated: (value: boolean) => void;
};

// Namespaced and versioned so an incompatible future shape change can bump
// to -v2 and be treated as absent, rather than misreading old data.
const CART_STORAGE_KEY = "zariya-cart-v1";
const CART_STORAGE_VERSION = 1;

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.price === "number" &&
    typeof item.quantity === "number"
  );
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,

      addItem: (item) =>
        set((state) => {
          const quantity = item.quantity ?? 1;
          const existing = state.items.find((line) => line.slug === item.slug);

          if (existing) {
            return {
              items: state.items.map((line) =>
                line.slug === item.slug
                  ? { ...line, quantity: line.quantity + quantity }
                  : line,
              ),
            };
          }

          return { items: [...state.items, { ...item, quantity }] };
        }),

      removeItem: (slug) =>
        set((state) => ({ items: state.items.filter((line) => line.slug !== slug) })),

      // Floors at 1 — reducing to 0 is a no-op. Removal is the separate
      // removeItem action, matching the design's distinct stepper/Remove link.
      updateQuantity: (slug, quantity) =>
        set((state) => ({
          items: state.items.map((line) =>
            line.slug === slug ? { ...line, quantity: Math.max(1, quantity) } : line,
          ),
        })),

      clearCart: () => set({ items: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Rehydration is triggered manually by CartProvider, not automatically
      // on store creation — see components/cart/CartProvider.tsx for why.
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      // Guards against valid-JSON-but-wrong-shape data (hand-edited, or left
      // over from an incompatible earlier schema): falls back to the
      // in-memory default (empty cart) instead of trusting garbage.
      merge: (persistedState, currentState) => {
        const candidateItems = (persistedState as { items?: unknown } | undefined)?.items;
        if (!Array.isArray(candidateItems) || !candidateItems.every(isValidCartItem)) {
          return currentState;
        }
        return { ...currentState, items: candidateItems };
      },
    },
  ),
);
