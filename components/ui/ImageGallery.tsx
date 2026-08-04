"use client";

import { useState } from "react";
import Image from "next/image";

type ImageGalleryProps = {
  images: string[];
  alt: string;
};

/**
 * Thumbnail click swaps the main image via local state — no Sanity or
 * cart involvement, purely presentational. Zero images renders a plain
 * blush frame, matching CategoryTile/ProductCard's empty-image pattern.
 */
export function ImageGallery({ images, alt }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-3/4 w-full bg-blush" />;
  }

  return (
    <div>
      <div className="relative aspect-3/4 w-full overflow-hidden bg-blush">
        <Image
          src={images[activeIndex]}
          alt={alt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-gutter">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Show image ${index + 1}`}
              onClick={() => setActiveIndex(index)}
              className={
                index === activeIndex
                  ? "relative aspect-square overflow-hidden bg-blush ring-1 ring-maroon"
                  : "relative aspect-square overflow-hidden bg-blush"
              }
            >
              <Image src={image} alt="" fill sizes="25vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
