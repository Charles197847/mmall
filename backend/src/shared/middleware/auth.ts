import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { Role } from '@prisma/client'
import { prisma } from '../database/index.js'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-change-me'

export type AuthToken = {
  sub: string
  email: string
  role: Role
}

export function signToken(payload: AuthToken, expiresIn?: jwt.SignOptions['expiresIn']) {
  const ttl = expiresIn ?? ((process.env.JWT_EXPIRES_IN ?? '2h') as jwt.SignOptions['expiresIn'])
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ttl })
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next()
  }

  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
  } catch {
    // ignore invalid tokens on optional routes
  }

  next()
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const token = header.slice(7)
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    next()
  }
}

export const requireAdmin = requireRole('ADMIN')

export async function requireVendor(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.user.role !== 'VENDOR' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Vendor access required' })
  }

  const vendor = await prisma.vendor.findUnique({
    where: { userId: req.user.id },
  })

  if (!vendor && req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Vendor profile not found' })
  }

  req.tenantId = vendor?.id
  next()
}
