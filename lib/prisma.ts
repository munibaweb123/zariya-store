import "server-only";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL — see .env.example.");
}
const databaseUrl: string = process.env.DATABASE_URL;

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  // Prisma 7 has no adapter-free PrismaClient for Postgres — this is the
  // standard @prisma/adapter-pg adapter (not the Neon-specific one, which
  // stays ruled out). connectionString is the pooled DATABASE_URL; migrations
  // use DIRECT_URL instead, via prisma.config.ts, not this file.
  const adapter = new PrismaPg(databaseUrl);
  return new PrismaClient({ adapter });
}

// globalThis-cached so Next.js dev hot-reload doesn't spawn a new client (and
// a new connection pool) on every file change. No phase may instantiate its
// own PrismaClient — import `prisma` from here instead.
export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
