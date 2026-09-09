import type { NextFunction, Request, Response } from 'express'
import { prisma, runWithContext } from '../database/index.js'

export async function setTenantContext(req: Request, _res: Response, next: NextFunction) {
  let tenantId = req.tenantId

  if (!tenantId && req.user) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    })
    tenantId = vendor?.id
    req.tenantId = tenantId
  }

  runWithContext(
    {
      userId: req.user?.id,
      tenantId,
      role: req.user?.role,
    },
    () => next(),
  )
}
