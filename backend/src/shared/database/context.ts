import { AsyncLocalStorage } from 'node:async_hooks'
import type { Role } from '@prisma/client'

export type RequestContext = {
  userId?: string
  tenantId?: string
  role?: Role
}

export const requestContext = new AsyncLocalStorage<RequestContext>()

export function getRequestContext(): RequestContext {
  return requestContext.getStore() ?? {}
}

export function runWithContext<T>(context: RequestContext, fn: () => T): T {
  return requestContext.run(context, fn)
}
