import { PrismaClient } from '@prisma/client'
import { getRequestContext } from './context.js'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const context = getRequestContext()
          if (context.tenantId || context.userId || context.role) {
            await client.$executeRaw`SELECT set_config('app.tenant_id', ${context.tenantId ?? ''}, true)`
            await client.$executeRaw`SELECT set_config('app.user_id', ${context.userId ?? ''}, true)`
            await client.$executeRaw`SELECT set_config('app.role', ${context.role ?? ''}, true)`
          }
          return query(args)
        },
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? (createClient() as unknown as PrismaClient)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { getRequestContext, runWithContext } from './context.js'
