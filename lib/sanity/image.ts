import "server-only";
import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityClient } from "./client";
import type { SanityImage } from "./queries";

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(image: SanityImage): string {
  return builder.image(image).url();
}
