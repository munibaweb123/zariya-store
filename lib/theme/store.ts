import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Theme = "light" | "dark";

type ThemeState = {
  theme: Theme;
  hasHydrated: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setHasHydrated: (value: boolean) => void;
};

// Namespaced and versioned like zariya-cart-v1 — an incompatible future
// shape change bumps to -v2 rather than misreading old data. Also hardcoded
// in the blocking inline script in app/(storefront)/layout.tsx (can't import
// this constant into a raw <script> tag) — keep both in sync if it changes.
const THEME_STORAGE_KEY = "zariya-theme-v1";
const THEME_STORAGE_VERSION = 1;

function isValidTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      hasHydrated: false,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle("dark", theme === "dark");
      },

      toggleTheme: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: THEME_STORAGE_KEY,
      version: THEME_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // Rehydration is triggered manually by ThemeProvider, not automatically
      // on store creation — see components/theme/ThemeProvider.tsx for why.
      skipHydration: true,
      partialize: (state) => ({ theme: state.theme }),
      // Guards against valid-JSON-but-wrong-shape data: falls back to the
      // in-memory default (light) instead of trusting garbage.
      merge: (persistedState, currentState) => {
        const candidateTheme = (persistedState as { theme?: unknown } | undefined)?.theme;
        if (!isValidTheme(candidateTheme)) return currentState;
        return { ...currentState, theme: candidateTheme };
      },
    },
  ),
);
