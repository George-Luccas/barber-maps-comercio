
import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrismaAuth: PrismaClient | undefined;
}

const authDbUrl = process.env.AUTH_DATABASE_URL;

export const dbAuth = globalThis.cachedPrismaAuth || new PrismaClient({
  log: ["error", "warn"],
  datasources: authDbUrl ? {
    db: {
      url: authDbUrl,
    },
  } : undefined,
});

if (process.env.NODE_ENV !== "production") {
  globalThis.cachedPrismaAuth = dbAuth;
}
