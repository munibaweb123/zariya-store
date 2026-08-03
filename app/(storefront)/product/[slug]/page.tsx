import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, listProductsByCategory } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";
import { formatPrice } from "@/lib/format";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ImageGallery } from "@/components/ui/ImageGallery";
import { Accordion } from "@/components/ui/Accordion";
import { ProductCard } from "@/components/ui/ProductCard";
import { PurchaseActions } from "@/components/product/PurchaseActions";

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const onSale = product.salePrice != null && product.salePrice < product.price;
  const effectivePrice = onSale ? (product.salePrice as number) : product.price;
  const images = product.images.map((image) => urlForImage(image));
  const categoryLabel = capitalize(product.category);

  const relatedProducts = (await listProductsByCategory(product.category))
    .filter((related) => related.slug !== product.slug)
    .slice(0, 4);

  return (
    <>
      <div className="px-margin-mobile py-4 md:px-margin-desktop">
        <p className="text-label-caps text-charcoal">
          <Link href="/" className="hover:text-maroon">
            Home
          </Link>{" "}
          /{" "}
          <Link href={`/category/${product.category}`} className="hover:text-maroon">
            {categoryLabel}
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-gutter px-margin-mobile pb-section-mobile md:grid-cols-2 md:gap-16 md:px-margin-desktop md:pb-section-desktop">
        <ImageGallery images={images} alt={product.name} />

        <div>
          <h1 className="font-heading text-display-lg-mobile text-charcoal md:text-display-lg">
            {product.name}
          </h1>

          <p className="mt-4 text-price-tag">
            {onSale && (
              <span className="mr-2 text-charcoal/50 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-maroon">{formatPrice(effectivePrice)}</span>
            {onSale && (
              <span className="ml-2 rounded-xs bg-maroon px-2 py-1 align-middle text-label-caps text-white">
                Sale
              </span>
            )}
          </p>

          <p className="mt-4 text-body-md text-charcoal">
            {product.description ?? "No description available for this product yet."}
          </p>

          <div className="mt-6">
            <PurchaseActions
              slug={product.slug}
              name={product.name}
              image={images[0] ?? ""}
              price={effectivePrice}
              inStock={product.inStock}
            />
          </div>

          <div className="mt-8">
            <Accordion
              items={[
                {
                  title: "Description",
                  defaultOpen: true,
                  content: product.description ?? "No description available for this product yet.",
                },
                {
                  title: "Materials & Care",
                  content:
                    "Handle with care. Avoid contact with water, perfume, and harsh chemicals. Store in a cool, dry place away from direct sunlight.",
                },
                {
                  title: "Shipping & Returns",
                  content:
                    "Nationwide delivery via TCS, Leopard, or PostEx. Cash on delivery available. Contact us on WhatsApp for returns or exchanges.",
                },
              ]}
            />
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="px-margin-mobile py-section-mobile md:px-margin-desktop md:py-section-desktop">
          <SectionHeading title="You may also like" />
          <div className="mt-6 grid grid-cols-2 gap-gutter md:grid-cols-4">
            {relatedProducts.map((related) => (
              <ProductCard key={related._id} product={related} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
