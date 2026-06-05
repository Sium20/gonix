import { PrismaClient } from "@prisma/client";

// Returns a no-op proxy when DATABASE_URL is not configured.
// All read methods resolve to [] / null / 0 so pages render with empty states
// instead of crashing during build or at runtime. Replace DATABASE_URL in your
// deployment environment to connect to a real database.
function createNullClient(): PrismaClient {
  const modelProxy = () =>
    new Proxy({} as Record<string, unknown>, {
      get(_, method) {
        if (method === "count") return () => Promise.resolve(0);
        if (method === "aggregate") return () => Promise.resolve({ _count: 0, _sum: {}, _avg: {}, _min: {}, _max: {} });
        if (method === "groupBy") return () => Promise.resolve([]);
        if (
          method === "findMany" ||
          method === "createMany" ||
          method === "updateMany" ||
          method === "deleteMany"
        )
          return () => Promise.resolve([]);
        // findUnique, findFirst, create, update, upsert, delete → null
        return () => Promise.resolve(null);
      },
    });

  return new Proxy({} as PrismaClient, {
    get(_, prop) {
      if (prop === "$connect" || prop === "$disconnect") return () => Promise.resolve();
      if (prop === "$transaction")
        return (arg: unknown) => {
          if (typeof arg === "function") return arg({} as PrismaClient);
          if (Array.isArray(arg)) return Promise.resolve(arg.map(() => null));
          return Promise.resolve(null);
        };
      return modelProxy();
    },
  });
}

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Both DATABASE_URL (pooler) and DIRECT_URL (direct) must be set for real queries.
// The schema uses directUrl so Prisma will throw at init if DIRECT_URL is missing.
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  (process.env.DATABASE_URL && process.env.DIRECT_URL
    ? new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      })
    : createNullClient());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
