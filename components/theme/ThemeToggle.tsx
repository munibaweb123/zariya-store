"use client";

import { useTheme } from "@/lib/theme/useTheme";

/**
 * Seam component, same contract as NavCartBadge: Nav.tsx renders this with
 * zero props and never touches theme state directly.
 *
 * Before hydration, hasHydrated is false — render the sun icon (light)
 * unconditionally rather than reading `theme`, since server output has no
 * knowledge of the client's actual stored/OS preference and must match the
 * first client render exactly to avoid a hydration mismatch. This is safe
 * because the blocking inline script in app/(storefront)/layout.tsx has
 * already set the correct .dark class on <html> before this ever mounts —
 * the page itself is never visibly wrong, only this one icon is briefly
 * generic until hasHydrated flips.
 */
export function ThemeToggle() {
  const { theme, hasHydrated, toggleTheme } = useTheme();
  const isDark = hasHydrated && theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="flex h-11 w-11 items-center justify-center"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
          <circle cx="12" cy="12" r="4" />
          <path
            strokeLinecap="round"
            d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32 1.41-1.41"
          />
        </svg>
      )}
    </button>
  );
}
