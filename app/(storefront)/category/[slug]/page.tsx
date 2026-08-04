import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listCategoryProducts,
  type Category,
  type SortOption,
} from "@/lib/sanity/queries";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FilterChips } from "@/components/category/FilterChips";
import { SortDropdown } from "@/components/category/SortDropdown";
import { ProductGrid } from "@/components/category/ProductGrid";

const CATEGORIES: Category[] = ["dresses", "perfumes", "beauty", "jewellery"];
const SORT_OPTIONS: SortOption[] = ["featured", "newest", "price-asc", "price-desc"];
const PRODUCTS_PER_PAGE = 12;

/**
 * Static category copy — there's no Sanity category document/description
 * field in the v1 schema, same kind of documented placeholder as
 * frontend/01's category-tile imagery. Replace with real Sanity-managed
 * copy if the owners ever need to edit this themselves.
 */
const CATEGORY_META: Record<Category | "all", { label: string; description: string }> = {
  all: {
    label: "All Products",
    description: "Browse our full collection across dresses, perfumes, beauty, and jewellery.",
  },
  dresses: {
    label: "Dresses",
    description: "Ethereal silhouettes and hand-embroidered craftsmanship for every occasion.",
  },
  perfumes: {
    label: "Perfumes",
    description: "Signature fragrances crafted to linger long after the moment has passed.",
  },
  beauty: {
    label: "Beauty",
    description: "Skincare and beauty essentials rooted in traditional, natural ingredients.",
  },
  jewellery: {
    label: "Jewellery",
    description: "Handcrafted pieces blending heritage craftsmanship with contemporary elegance.",
  },
};

function isCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

function isSortOption(value: string | undefined): value is SortOption {
  return !!value && (SORT_OPTIONS as string[]).includes(value);
}

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; limit?: string }>;
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort: sortParam, limit: limitParam } = await searchParams;

  if (slug !== "all" && !isCategory(slug)) {
    notFound();
  }

  const category = slug as Category | "all";
  const sort: SortOption = isSortOption(sortParam) ? sortParam : "featured";
  const parsedLimit = Number(limitParam);
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit > PRODUCTS_PER_PAGE
      ? parsedLimit
      : PRODUCTS_PER_PAGE;

  const allProducts = await listCategoryProducts(category, sort);
  const visibleProducts = allProducts.slice(0, limit);
  const meta = CATEGORY_META[category];
  const hasMore = allProducts.length > limit;

  return (
    <>
      <div className="px-margin-mobile py-4 md:px-margin-desktop">
        <p className="text-label-caps text-charcoal">
          <Link href="/" className="hover:text-maroon">
            Home
          </Link>{" "}
          / {meta.label}
        </p>
      </div>

      <div className="bg-blush px-margin-mobile py-section-mobile text-center md:px-margin-desktop md:py-section-desktop">
        <SectionHeading title={meta.label} />
        <p className="mt-2 text-body-md text-charcoal">{meta.description}</p>
      </div>

      <div className="px-margin-mobile py-section-mobile md:px-margin-desktop md:py-section-desktop">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-body-md text-charcoal">{allProducts.length} products</p>
          <SortDropdown category={category} sort={sort} />
        </div>

        <div className="mt-6">
          <FilterChips activeSlug={category} />
        </div>

        <div className="mt-8">
          <ProductGrid products={visibleProducts} />
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Link
              href={`/category/${category}?sort=${sort}&limit=${limit + PRODUCTS_PER_PAGE}`}
              className="inline-flex min-h-12 items-center justify-center rounded-xs border border-charcoal px-8 text-label-caps text-charcoal"
            >
              Load more
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
