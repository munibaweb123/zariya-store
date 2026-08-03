import "server-only";
import { groq } from "next-sanity";
import { sanityClient } from "./client";

// Fixed ISR window used by every query here — see infra/02's Architectural
// Constraints. Do not vary this per-query; page phases should not invent
// their own freshness window.
const SANITY_REVALIDATE_SECONDS = 60;

export type Category = "dresses" | "perfumes" | "beauty" | "jewellery";

export type SanityImage = {
  asset: { _ref: string; _type: "reference" };
};

export type Product = {
  _id: string;
  _createdAt: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  category: Category;
  images: SanityImage[];
  description: string | null;
  inStock: boolean;
  featured: boolean;
};

const PRODUCT_PROJECTION = groq`{
  _id,
  _createdAt,
  name,
  "slug": slug.current,
  price,
  salePrice,
  category,
  images,
  description,
  inStock,
  featured
}`;

async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  return sanityClient.fetch<T>(query, params, {
    next: { revalidate: SANITY_REVALIDATE_SECONDS },
  });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const query = groq`*[_type == "product" && slug.current == $slug][0] ${PRODUCT_PROJECTION}`;
  return sanityFetch<Product | null>(query, { slug });
}

export async function listProductsByCategory(category: Category): Promise<Product[]> {
  const query = groq`*[_type == "product" && category == $category] | order(_createdAt desc) ${PRODUCT_PROJECTION}`;
  return sanityFetch<Product[]>(query, { category });
}

export async function listFeaturedProducts(limit = 8): Promise<Product[]> {
  // `limit` is a `number` parameter (never user-supplied text), so interpolating
  // it directly into the slice is safe — GROQ range slices don't reliably
  // accept $-parameters across Sanity API versions.
  const query = groq`*[_type == "product" && featured == true] | order(_createdAt desc) [0...${limit}] ${PRODUCT_PROJECTION}`;
  return sanityFetch<Product[]>(query);
}

export async function listNewArrivals(limit = 8): Promise<Product[]> {
  const query = groq`*[_type == "product"] | order(_createdAt desc) [0...${limit}] ${PRODUCT_PROJECTION}`;
  return sanityFetch<Product[]>(query);
}

// Added by frontend/01: one round trip for all four category tiles, instead
// of four separate listProductsByCategory calls. Returns the most recent
// product per category (or null if that category has no products yet).
export type CategoryPreviews = Record<Category, Product | null>;

export async function listCategoryPreviews(): Promise<CategoryPreviews> {
  const query = groq`{
    "dresses": *[_type == "product" && category == "dresses"] | order(_createdAt desc) [0] ${PRODUCT_PROJECTION},
    "perfumes": *[_type == "product" && category == "perfumes"] | order(_createdAt desc) [0] ${PRODUCT_PROJECTION},
    "beauty": *[_type == "product" && category == "beauty"] | order(_createdAt desc) [0] ${PRODUCT_PROJECTION},
    "jewellery": *[_type == "product" && category == "jewellery"] | order(_createdAt desc) [0] ${PRODUCT_PROJECTION}
  }`;
  return sanityFetch<CategoryPreviews>(query);
}
