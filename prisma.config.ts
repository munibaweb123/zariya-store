import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js auto-loads .env.local for `next dev`/`next build`, but the
// standalone Prisma CLI doesn't go through Next at all — plain "dotenv/config"
// only loads .env by default, which this project doesn't have. Load .env.local
// explicitly so `prisma migrate`/`generate` see the same values the app does.
config({ path: ".env.local" });

// This URL is used by the Prisma CLI only (migrate, introspection) — the
// running app never reads this file. It must be Neon's DIRECT (non-pooled)
// connection string: migrations run DDL/advisory locks that don't work
// reliably through PgBouncer transaction-mode pooling. The app's runtime
// queries use DATABASE_URL (pooled) instead, wired directly into the
// @prisma/adapter-pg adapter in lib/prisma.ts — see infra/02's Architectural
// Constraints for why this split exists across two files instead of one.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
