import {
  listCategoryPreviews,
  listFeaturedProducts,
  listNewArrivals,
  type Category,
} from "@/lib/sanity/queries";
import { Hero } from "@/components/home/Hero";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { CategoryTile } from "@/components/ui/CategoryTile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/ui/ProductCard";
import { TrustStrip } from "@/components/ui/TrustStrip";

const CATEGORY_TILES: { label: string; category: Category }[] = [
  { label: "Dresses", category: "dresses" },
  { label: "Perfumes", category: "perfumes" },
  { label: "Beauty", category: "beauty" },
  { label: "Jewellery", category: "jewellery" },
];

export default async function Home() {
  // Exactly three Sanity fetches for this whole page — see frontend/01-home-page's
  // Architectural Constraints. Child components receive data as props; none
  // of them fetch on their own.
  const [categoryPreviews, featuredProducts, newArrivals] = await Promise.all([
    listCategoryPreviews(),
    listFeaturedProducts(4),
    listNewArrivals(4),
  ]);

  return (
    <>
      <Hero />

      <div className="grid grid-cols-2 gap-gutter px-margin-mobile py-section-mobile md:grid-cols-4 md:px-margin-desktop md:py-section-desktop">
        {CATEGORY_TILES.map((tile) => (
          <CategoryTile
            key={tile.category}
            label={tile.label}
            category={tile.category}
            product={categoryPreviews[tile.category]}
          />
        ))}
      </div>

      {featuredProducts.length > 0 && (
        <div className="px-margin-mobile py-section-mobile md:px-margin-desktop md:py-section-desktop">
          <SectionHeading
            title="Bestsellers"
            link={{ href: "/category/all?sort=featured", label: "View All" }}
          />
          <div className="mt-6 grid grid-cols-2 gap-gutter md:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}

      <TrustStrip />

      {newArrivals.length > 0 && (
        <div className="px-margin-mobile py-section-mobile md:px-margin-desktop md:py-section-desktop">
          <SectionHeading
            title="New Arrivals"
            link={{ href: "/category/all?sort=newest", label: "Explore More" }}
          />
          <div className="mt-6 grid grid-cols-2 gap-gutter md:grid-cols-4">
            {newArrivals.map((product, index) => (
              <ProductCard key={product._id} product={product} highlightNew={index === 0} />
            ))}
          </div>
        </div>
      )}

      <InstagramStrip />
    </>
  );
}
