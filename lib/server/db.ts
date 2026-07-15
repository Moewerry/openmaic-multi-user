import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

/**
 * Shared Prisma client. Returns null when DATABASE_URL is unset so upstream
 * OpenMAIC single-machine usage still works without PostgreSQL.
 */
export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

/** Prisma client when DATABASE_URL is configured; throws if missing. */
export function requirePrisma(): PrismaClient {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error('DATABASE_URL is not configured');
  }
  return prisma;
}
