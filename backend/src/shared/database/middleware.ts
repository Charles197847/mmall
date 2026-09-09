import type { NextFunction, Request, Response } from 'express'
import { prisma } from './index.js'
import { getRequestContext } from './context.js'

/** Apply RLS session variables for the current request. */
export async function applyTenantSession(_req: Request, _res: Response, next: NextFunction) {
  const context = getRequestContext()

  if (context.tenantId) {
    await prisma.$executeRaw`SELECT set_config('app.tenant_id', ${context.tenantId}, true)`
  }

  if (context.userId) {
    await prisma.$executeRaw`SELECT set_config('app.user_id', ${context.userId}, true)`
  }

  if (context.role) {
    await prisma.$executeRaw`SELECT set_config('app.role', ${context.role}, true)`
  }

  next()
}
