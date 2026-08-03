import "server-only";
import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;

if (!projectId || !dataset || !apiVersion) {
  throw new Error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or NEXT_PUBLIC_SANITY_API_VERSION — see .env.example.",
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  // Freshness is controlled entirely by Next's fetch-level revalidate window
  // (see lib/sanity/queries.ts) — Sanity's own CDN cache would otherwise
  // introduce a second, uncoordinated caching layer on top of that.
  useCdn: false,
});
