// Dynamic safe wrapper for PrismaClient to prevent build crashes when @prisma/client is pending generation
/* eslint-disable @typescript-eslint/no-explicit-any */

let prismaInstance: any = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = globalThis as unknown as { prisma: any };

  prismaInstance =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch {
  console.warn('@prisma/client module is not installed or generated yet. Fallback memory/file store will be used.');
  prismaInstance = null;
}

export const prisma = prismaInstance;
