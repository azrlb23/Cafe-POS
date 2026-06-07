import { PrismaClient } from '@prisma/client';

// Singleton pattern to avoid multiple PrismaClient instances
// SQLite only supports one writer at a time, so multiple instances
// can cause SQLITE_BUSY errors under concurrent requests.

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
