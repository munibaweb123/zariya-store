import Link from "next/link";
import type { Category } from "@/lib/sanity/queries";

type ChipDef = { label: string; slug: Category | "all" };

const CHIPS: ChipDef[] = [
  { label: "All", slug: "all" },
  { label: "Dresses", slug: "dresses" },
  { label: "Perfumes", slug: "perfumes" },
  { label: "Beauty", slug: "beauty" },
  { label: "Jewellery", slug: "jewellery" },
];

type FilterChipsProps = {
  activeSlug: Category | "all";
};

/**
 * Category switcher, not a facet filter. The design reference shows chips
 * as subcategories (Earrings, Necklaces...) that don't exist in the v1
 * schema — adding that taxonomy is out of scope. Rather than hide this row
 * on single-category pages, it keeps its visual position and switches
 * category instead. If subcategories are ever added to the schema, they
 * belong here and this switcher should move to a different affordance.
 */
export function FilterChips({ activeSlug }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((chip) => {
        const active = chip.slug === activeSlug;
        return (
          <Link
            key={chip.slug}
            href={`/category/${chip.slug}`}
            className={
              active
                ? "rounded-xs bg-maroon px-4 py-2 text-label-caps text-white"
                : "rounded-xs border border-line px-4 py-2 text-label-caps text-charcoal"
            }
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
