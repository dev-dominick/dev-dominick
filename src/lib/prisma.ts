import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Direct Prisma singleton
 * Errors propagate naturally - no silent failures from optional chaining
 * If database connection fails, the error is thrown immediately
 */
export const prisma =
  globalForPrisma.prisma ||
  (globalForPrisma.prisma = new PrismaClient())


