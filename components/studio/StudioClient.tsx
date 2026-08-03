"use client";

import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

// Sanity Studio is a full browser SPA. This wrapper keeps sanity.config.ts
// and everything it pulls in entirely inside the client bundle — if a Server
// Component imported it directly, Next would try to trace/evaluate the whole
// Studio dependency graph server-side, which breaks on internal packages
// that aren't RSC-clean (e.g. a client-only `swr` import).
export function StudioClient() {
  return <NextStudio config={config} />;
}
