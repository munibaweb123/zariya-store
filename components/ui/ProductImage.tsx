import Image from "next/image";
import type { ComponentPropsWithoutRef } from "react";

type ImageOwnProps = "src" | "alt" | "fill" | "className";

type ProductImageProps = {
  src: string;
  alt: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Image>, ImageOwnProps>;

/**
 * Shared product photography frame: blush background, sharp 90deg corners,
 * no shadow. Owned here so home/category/product-detail render matching grids.
 */
export function ProductImage({ src, alt, className, ...props }: ProductImageProps) {
  const wrapperClasses = ["relative aspect-3/4 w-full overflow-hidden bg-blush", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 25vw, 50vw"
        className="object-cover"
        {...props}
      />
    </div>
  );
}
