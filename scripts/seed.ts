/**
 * Sample-data seed script for local/dev use only.
 * Never imported by application code — run on demand:
 *   npx tsx scripts/seed.ts
 *
 * Guards (see infra/02's Architectural Constraints):
 * - Requires SANITY_SEED_TOKEN (separate from any token the running app uses).
 * - Refuses to run against anything but the development dataset.
 * - Idempotent: fixed _id per document, so re-running replaces rather than duplicates.
 */
import { config } from "dotenv";
import { createClient } from "@sanity/client";
import sharp from "sharp";

// This script runs standalone via `npx tsx`, outside Next's own dev/build
// process, so nothing else loads .env.local for it automatically.
config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
const seedToken = process.env.SANITY_SEED_TOKEN;

if (!seedToken) {
  console.error(
    "Refusing to seed: SANITY_SEED_TOKEN is not set. Add it to .env.local — see .env.example.",
  );
  process.exit(1);
}

if (!projectId || !dataset || !apiVersion) {
  console.error(
    "Refusing to seed: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or NEXT_PUBLIC_SANITY_API_VERSION is not set.",
  );
  process.exit(1);
}

const DEV_DATASET_NAME = "development";
if (dataset !== DEV_DATASET_NAME) {
  console.error(
    `Refusing to seed dataset "${dataset}" — this script only ever runs against "${DEV_DATASET_NAME}".`,
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: seedToken,
  useCdn: false,
});

type SeedProduct = {
  _id: string;
  name: string;
  category: "dresses" | "perfumes" | "beauty" | "jewellery";
  price: number;
  salePrice?: number;
  inStock: boolean;
  featured: boolean;
  color: string;
};

// Sample/seed data only — never real catalog content. Covers every case
// downstream page phases need to verify against: one per category, a sale
// price (badge + strikethrough), an out-of-stock item, and 4+ featured
// products so the bestsellers grid fills a full row.
const SEED_PRODUCTS: SeedProduct[] = [
  { _id: "seed-product-dresses-1", name: "Maroon Embroidered Maxi", category: "dresses", price: 6500, featured: true, inStock: true, color: "#7a1e3a" },
  { _id: "seed-product-dresses-2", name: "Blush Chiffon Anarkali", category: "dresses", price: 8200, salePrice: 6900, featured: true, inStock: true, color: "#e7c7ce" },
  { _id: "seed-product-perfumes-1", name: "Zariya Signature Oud", category: "perfumes", price: 4200, featured: true, inStock: true, color: "#2b2b2b" },
  { _id: "seed-product-perfumes-2", name: "Rose Mist Attar", category: "perfumes", price: 2800, featured: false, inStock: false, color: "#c98ca0" },
  { _id: "seed-product-beauty-1", name: "Kohl Eyeliner Duo", category: "beauty", price: 1200, featured: true, inStock: true, color: "#1b1c1c" },
  { _id: "seed-product-beauty-2", name: "Rose Water Face Mist", category: "beauty", price: 950, featured: false, inStock: true, color: "#f8f3f4" },
  { _id: "seed-product-jewellery-1", name: "Pearl Drop Earrings", category: "jewellery", price: 3200, featured: true, inStock: true, color: "#dbc0c4" },
  { _id: "seed-product-jewellery-2", name: "Kundan Choker Set", category: "jewellery", price: 9800, featured: false, inStock: true, color: "#a03b56" },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function placeholderImageBuffer(label: string, color: string): Promise<Buffer> {
  const svg = `
    <svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="1000" fill="${color}" />
      <text x="400" y="500" font-family="sans-serif" font-size="36" fill="#ffffff"
            text-anchor="middle" dominant-baseline="middle">${label}</text>
    </svg>
  `;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function uploadPlaceholderImage(product: SeedProduct) {
  const buffer = await placeholderImageBuffer(product.name, product.color);
  const asset = await client.assets.upload("image", buffer, {
    filename: `${product._id}.png`,
  });
  return asset;
}

async function seed() {
  console.log(`Seeding ${SEED_PRODUCTS.length} sample products into dataset "${dataset}"...`);

  for (const product of SEED_PRODUCTS) {
    const asset = await uploadPlaceholderImage(product);

    await client.createOrReplace({
      _id: product._id,
      _type: "product",
      name: product.name,
      slug: { _type: "slug", current: slugify(product.name) },
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      category: product.category,
      images: [
        {
          _type: "image",
          _key: "seed-image-0",
          asset: { _type: "reference", _ref: asset._id },
        },
      ],
      description: `Sample seed data for "${product.name}" — replace with real catalog content in Sanity Studio.`,
      inStock: product.inStock,
      featured: product.featured,
    });

    console.log(`  ✓ ${product.name} (${product.category})`);
  }

  console.log("Done.");
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
