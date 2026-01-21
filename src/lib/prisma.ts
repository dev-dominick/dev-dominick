import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialize to avoid issues during dev
let prismaInstance: PrismaClient | null = null

export function getPrisma() {
  if (!prismaInstance) {
    try {
      prismaInstance = new PrismaClient()
    } catch (e) {
      console.warn('Prisma initialization failed:', e)
      // Continue without Prisma in development
      return null
    }
  }
  return prismaInstance
}

export const prisma = new Proxy(new Object(), {
  get() {
    const instance = getPrisma()
    return instance ? instance : null
  },
}) as any

if (process.env.NODE_ENV !== 'production' && prismaInstance) {
  globalForPrisma.prisma = prismaInstance
}


