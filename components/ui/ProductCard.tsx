import Link from "next/link";
import { ProductImage } from "./ProductImage";
import { formatPrice } from "@/lib/format";
import { urlForImage } from "@/lib/sanity/image";
import type { Product } from "@/lib/sanity/queries";

type ProductCardProps = {
  product: Product;
  /** Presentational only — "new" is not a stored field, the parent section decides. */
  highlightNew?: boolean;
};

export function ProductCard({ product, highlightNew = false }: ProductCardProps) {
  const image = product.images[0];
  const onSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <Link href={`/product/${product.slug}`} className="block">
      <div className="relative">
        {image ? (
          <ProductImage src={urlForImage(image)} alt={product.name} />
        ) : (
          <div className="aspect-3/4 w-full bg-blush dark:bg-blush-dark" />
        )}
        {onSale ? (
          <span className="absolute left-0 top-0 rounded-xs bg-maroon px-2 py-1 text-label-caps text-white dark:bg-maroon-dark-solid">
            Sale
          </span>
        ) : (
          highlightNew && (
            <span className="absolute left-0 top-0 rounded-xs bg-charcoal px-2 py-1 text-label-caps text-white dark:border dark:border-line-dark dark:bg-white-dark dark:text-charcoal-dark">
              New
            </span>
          )
        )}
      </div>
      <p className="mt-3 text-body-md text-charcoal dark:text-charcoal-dark">{product.name}</p>
      <p className="mt-1 text-price-tag">
        {onSale && (
          <span className="mr-2 text-charcoal/50 line-through dark:text-charcoal-dark/50">
            {formatPrice(product.price)}
          </span>
        )}
        <span className="text-maroon dark:text-maroon-dark">
          {formatPrice(onSale ? (product.salePrice as number) : product.price)}
        </span>
      </p>
    </Link>
  );
}
