import Link from "next/link";
import Image from "next/image";
import type { Category, Product } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";

type CategoryTileProps = {
  label: string;
  category: Category;
  product: Product | null;
};

/**
 * Placeholder behavior, not a permanent feature: tile imagery currently
 * derives from the most recent product in each category. When real category
 * hero photography exists, replace this with a dedicated image field (a
 * Sanity category document, or a static asset per category) — otherwise
 * changing a product's order silently changes the home page.
 */
export function CategoryTile({ label, category, product }: CategoryTileProps) {
  const image = product?.images[0];

  return (
    <Link href={`/category/${category}`} className="group block">
      <div className="relative aspect-4/5 w-full overflow-hidden bg-blush">
        {image && (
          <Image
            src={urlForImage(image)}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        )}
      </div>
      <p className="mt-3 text-center text-label-caps text-charcoal">{label}</p>
    </Link>
  );
}
