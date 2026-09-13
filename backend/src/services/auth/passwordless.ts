import { randomBytes, randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '../../shared/database/index.js'
import { signToken } from '../../shared/middleware/auth.js'
import { HttpError } from '../../shared/middleware/error.js'

type Purpose = 'login' | 'signup'
type Role = 'CUSTOMER' | 'VENDOR'

type Challenge = {
  email: string
  purpose: Purpose
  role: Role
  hash: string
  kind: 'otp' | 'magic'
  expires: number
  attempts: number
  firstName?: string
  lastName?: string
}

const challenges = new Map<string, Challenge>()

function publicUser(user: {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'
  phone?: string | null
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone ?? null,
  }
}

function sessionFor(user: { id: string; email: string; firstName: string; lastName: string; role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'; phone?: string | null }) {
  return {
    token: signToken({ sub: user.id, email: user.email, role: user.role }),
    user: publicUser(user),
  }
}

function take(id: string) {
  const row = challenges.get(id)
  if (!row || row.expires < Date.now()) {
    challenges.delete(id)
    throw new HttpError(400, 'That code or link has expired.')
  }
  return row
}

async function findOrCreate(email: string, role: Role, firstName?: string, lastName?: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    if (role === 'VENDOR' && existing.role === 'CUSTOMER') {
      throw new HttpError(403, 'This email is a shopper account. Use shopper sign-in.')
    }
    if (role === 'CUSTOMER' && existing.role === 'VENDOR') {
      throw new HttpError(403, 'This email is a merchant account. Use merchant sign-in.')
    }
    return existing
  }
  if (role === 'VENDOR') throw new HttpError(404, 'No merchant account for this email. Create a store first.')
  const passwordHash = await bcrypt.hash(randomBytes(24).toString('hex'), 10)
  return prisma.user.create({
    data: {
      email,
      firstName: firstName?.trim() || 'Shopper',
      lastName: lastName?.trim() || 'MMall',
      role: 'CUSTOMER',
      passwordHash,
    },
  })
}

export async function sendEmailOtp(input: {
  email: string
  purpose: Purpose
  role: Role
  firstName?: string
  lastName?: string
}) {
  const code = String(randomInt(100000, 1000000))
  const id = randomBytes(12).toString('hex')
  challenges.set(id, {
    email: input.email.toLowerCase(),
    purpose: input.purpose,
    role: input.role,
    kind: 'otp',
    hash: await bcrypt.hash(code, 8),
    expires: Date.now() + 10 * 60 * 1000,
    attempts: 0,
    firstName: input.firstName,
    lastName: input.lastName,
  })
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[email-otp] ${input.email} -> ${code}`)
  }
  return {
    otpId: id,
    demoCode: process.env.NODE_ENV === 'production' ? undefined : code,
  }
}

export async function sendMagicLink(input: {
  email: string
  purpose: Purpose
  role: Role
  firstName?: string
  lastName?: string
}) {
  const token = randomBytes(24).toString('hex')
  challenges.set(token, {
    email: input.email.toLowerCase(),
    purpose: input.purpose,
    role: input.role,
    kind: 'magic',
    hash: await bcrypt.hash(token, 8),
    expires: Date.now() + 20 * 60 * 1000,
    attempts: 0,
    firstName: input.firstName,
    lastName: input.lastName,
  })
  const path = input.role === 'VENDOR' ? '/login' : '/shop/login'
  const demoLink =
    process.env.NODE_ENV === 'production'
      ? undefined
      : `${process.env.PUBLIC_SHOP_ORIGIN ?? 'http://localhost:3001'}${path}?magic=${token}`
  if (demoLink) console.log(`[magic] ${input.email} -> ${demoLink}`)
  return { sent: true, demoLink }
}

export async function verifyEmailOtp(input: { otpId: string; code: string }) {
  const row = take(input.otpId)
  if (row.kind !== 'otp') throw new HttpError(400, 'Use the email code from that request.')
  if (row.attempts >= 5) throw new HttpError(400, 'Too many tries. Request a new code.')
  const match = await bcrypt.compare(input.code, row.hash)
  if (!match) {
    row.attempts += 1
    throw new HttpError(400, 'Invalid email code.')
  }
  challenges.delete(input.otpId)
  const user = await findOrCreate(row.email, row.role, row.firstName, row.lastName)
  return sessionFor(user)
}

export async function consumeMagic(token: string) {
  const row = take(token)
  if (row.kind !== 'magic') throw new HttpError(400, 'This is not a magic link.')
  challenges.delete(token)
  const user = await findOrCreate(row.email, row.role, row.firstName, row.lastName)
  return sessionFor(user)
}
