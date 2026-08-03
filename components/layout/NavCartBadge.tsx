"use client";

import Link from "next/link";

type NavCartBadgeProps = {
  count?: number;
};

/**
 * Contract with frontend/03-cart-state: this file is the only thing that
 * phase touches to wire in the live cart count. Nav.tsx itself is never
 * modified — it just renders <NavCartBadge /> with no props today.
 */
export function NavCartBadge({ count = 0 }: NavCartBadgeProps) {
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative flex h-11 w-11 items-center justify-center"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 8V6a3 3 0 1 1 6 0v2m-8 0h10l1 12H5L6 8Z"
        />
      </svg>
      {count > 0 && (
        <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-maroon px-1 text-label-caps text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
