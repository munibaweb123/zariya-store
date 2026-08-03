"use client";

import { useRouter } from "next/navigation";
import type { Category, SortOption } from "@/lib/sanity/queries";

const SORT_LABELS: Record<SortOption, string> = {
  featured: "Featured",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

type SortDropdownProps = {
  category: Category | "all";
  sort: SortOption;
};

/**
 * Sort state lives entirely in the URL (?sort=), not in client state — the
 * page stays a Server Component and sorted URLs stay shareable. This leaf
 * only needs an onChange handler to push a new route, so it's the sole
 * 'use client' component this phase adds. Changing sort resets to the
 * default page size (no ?limit=) rather than carrying over an expanded
 * "load more" count into a freshly re-ordered list.
 */
export function SortDropdown({ category, sort }: SortDropdownProps) {
  const router = useRouter();

  return (
    <select
      aria-label="Sort products"
      value={sort}
      onChange={(event) => {
        router.push(`/category/${category}?sort=${event.target.value}`);
      }}
      className="border border-line bg-white px-3 py-2 text-label-caps text-charcoal"
    >
      {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
        <option key={option} value={option}>
          {SORT_LABELS[option]}
        </option>
      ))}
    </select>
  );
}
