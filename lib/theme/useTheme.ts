import { useThemeStore } from "./store";

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return { theme, hasHydrated, setTheme, toggleTheme };
}
