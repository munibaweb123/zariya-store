import { ProductCard } from "@/components/ui/ProductCard";
import type { Product } from "@/lib/sanity/queries";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="text-body-md text-charcoal">No products found in this category yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-gutter md:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
