import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient | undefined;
}

export const db = globalThis.cachedPrisma || new PrismaClient({
  log: ["query", "error", "warn"],
});

if (process.env.NODE_ENV !== "production") {
  globalThis.cachedPrisma = db;
}