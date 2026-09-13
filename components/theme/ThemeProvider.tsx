"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/theme/store";

type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * Not a React Context — Zustand's store is already a plain hook. This only
 * rehydrates the persisted theme on mount, then reconciles it against
 * document.documentElement's class list, which the blocking inline script
 * in app/(storefront)/layout.tsx already set synchronously pre-hydration
 * from its own localStorage read. If the store's validated result ends up
 * disagreeing with what the script set (e.g. corrupt persisted data falling
 * back to "light" while the DOM still has .dark from the script), the DOM
 * class is corrected to match the store, since the store's merge validation
 * is the more defensive of the two reads.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    async function hydrate() {
      try {
        await useThemeStore.persist.rehydrate();
      } catch {
        useThemeStore.setState({ theme: "light" });
      } finally {
        const theme = useThemeStore.getState().theme;
        document.documentElement.classList.toggle("dark", theme === "dark");
        useThemeStore.setState({ hasHydrated: true });
      }
    }

    hydrate();
  }, []);

  return <>{children}</>;
}
