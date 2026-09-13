import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { randomInt } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '../../shared/database/index.js'
import { requireAuth, signToken } from '../../shared/middleware/auth.js'
import { asyncHandler, HttpError } from '../../shared/middleware/error.js'
import { ensureVendorKyc, serializeKyc } from '../../shared/kyc.js'
import { readPlatformSettings } from '../../shared/platform-settings.js'
import { uniqueSlug } from '../../shared/utils/slug.js'
import { asJson } from '../../shared/utils/http.js'
import {
  authenticationOptions,
  listPasskeys,
  registrationOptions,
  verifyAuthentication,
  verifyRegistration,
} from './passkeys.js'
import { consumeMagic, sendEmailOtp, sendMagicLink, verifyEmailOtp } from './passwordless.js'

const router = Router()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['CUSTOMER', 'VENDOR']).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const phoneSchema = z
  .string()
  .min(10)
  .max(16)
  .regex(/^\+?[0-9\s-]{10,16}$/)
  .transform((value) => value.replace(/[\s-]/g, ''))

function publicUser(user: {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'CUSTOMER' | 'VENDOR' | 'ADMIN'
  phone?: string | null
  deliveryAddress?: unknown
}) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone ?? null,
    deliveryAddress: (user.deliveryAddress as Record<string, string> | null) ?? null,
  }
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(body.password, 12)
    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role ?? 'CUSTOMER',
        passwordHash,
      },
    })

    const token = signToken({ sub: user.id, email: user.email, role: user.role })
    res.status(201).json({ token, user: publicUser(user) })
  }),
)

router.post(
  '/otp/send',
  asyncHandler(async (req, res) => {
    const { phone } = z.object({ phone: phoneSchema }).parse(req.body)
    const code = String(randomInt(100000, 1000000))
    const codeHash = await bcrypt.hash(code, 8)
    const otp = await prisma.phoneOtp.create({
      data: {
        phone,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[otp] ${phone} -> ${code}`)
    }
    res.json({
      otpId: otp.id,
      demoCode: process.env.NODE_ENV === 'production' ? undefined : code,
    })
  }),
)

router.post(
  '/register/vendor',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        fullName: z.string().min(3),
        email: z.string().email(),
        phone: phoneSchema,
        password: z.string().min(8),
        otpId: z.string().min(8),
        otpCode: z.string().length(6),
        storeName: z.string().min(2).optional(),
      })
      .parse(req.body)

    const otp = await prisma.phoneOtp.findUnique({ where: { id: body.otpId } })
    if (!otp || otp.phone !== body.phone) throw new HttpError(400, 'Invalid verification code')
    if (otp.expiresAt < new Date()) throw new HttpError(400, 'Verification code expired')
    if (otp.attempts >= 5) throw new HttpError(400, 'Too many attempts. Request a new code.')
    const match = await bcrypt.compare(body.otpCode, otp.codeHash)
    if (!match) {
      await prisma.phoneOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } })
      throw new HttpError(400, 'Invalid verification code')
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) throw new HttpError(409, 'Email already registered')
    const phoneTaken = await prisma.user.findUnique({ where: { phone: body.phone } })
    if (phoneTaken) throw new HttpError(409, 'Phone number already registered')

    const parts = body.fullName.trim().split(/\s+/)
    const firstName = parts[0]
    const lastName = parts.slice(1).join(' ') || parts[0]
    const storeName = body.storeName?.trim() || `${firstName}'s store`
    const passwordHash = await bcrypt.hash(body.password, 12)
    const { defaultCommission } = readPlatformSettings()

    const result = await prisma.$transaction(async (tx) => {
      await tx.phoneOtp.update({
        where: { id: otp.id },
        data: { verifiedAt: new Date() },
      })
      const user = await tx.user.create({
        data: {
          email: body.email,
          firstName,
          lastName,
          phone: body.phone,
          phoneVerifiedAt: new Date(),
          role: 'VENDOR',
          passwordHash,
        },
      })
      const vendor = await tx.vendor.create({
        data: {
          userId: user.id,
          storeName,
          slug: uniqueSlug(storeName),
          description: 'Draft store — verify to go live on MMall.',
          commissionRate: defaultCommission,
          isActive: false,
          isApproved: false,
        },
      })
      await tx.vendorKyc.create({ data: { vendorId: vendor.id } })
      return { user, vendor }
    })

    const token = signToken({
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
    })
    res.status(201).json({
      token,
      user: publicUser(result.user),
      vendor: result.vendor,
    })
  }),
)

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = signToken({ sub: user.id, email: user.email, role: user.role })
    res.json({ token, user: publicUser(user) })
  }),
)

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { vendorProfile: { include: { kyc: true } } },
    })
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const kyc = user.vendorProfile
      ? serializeKyc(user.vendorProfile.kyc ?? (await ensureVendorKyc(user.vendorProfile.id)))
      : null

    res.json({
      ...publicUser(user),
      vendor: user.vendorProfile,
      kyc,
    })
  }),
)

const addressSchema = z.object({
  fullName: z.string().optional(),
  line1: z.string().optional(),
  street: z.string().optional(),
  city: z.string().min(2),
  state: z.string().optional(),
  postalCode: z.string().min(2),
  country: z.string().optional(),
})

router.patch(
  '/address',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = addressSchema.parse(req.body)
    const current = await prisma.user.findUnique({ where: { id: req.user!.id } })
    const previous = (current?.deliveryAddress ?? {}) as Record<string, string>
    const deliveryAddress = {
      fullName: body.fullName ?? previous.fullName ?? '',
      line1: body.line1 ?? body.street ?? previous.line1 ?? previous.street ?? '',
      street: body.street ?? body.line1 ?? previous.street ?? previous.line1 ?? '',
      city: body.city,
      state: body.state ?? previous.state ?? '',
      postalCode: body.postalCode,
      country: body.country ?? previous.country ?? 'South Africa',
    }
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { deliveryAddress: asJson(deliveryAddress) },
    })
    res.json(publicUser(user))
  }),
)

router.get(
  '/passkeys',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await listPasskeys(req.user!.id))
  }),
)

router.post(
  '/passkeys/register/options',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await registrationOptions(req.user!.id))
  }),
)

router.post(
  '/passkeys/register/verify',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await verifyRegistration(req.user!.id, req.body))
  }),
)

router.post(
  '/passkeys/authenticate/options',
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email : undefined
    res.json(await authenticationOptions(email))
  }),
)

router.post(
  '/passkeys/authenticate/verify',
  asyncHandler(async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email : undefined
    res.json(await verifyAuthentication(req.body.response ?? req.body, email))
  }),
)

const passwordlessSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['login', 'signup']).default('login'),
  role: z.enum(['CUSTOMER', 'VENDOR']).default('CUSTOMER'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

router.post(
  '/email-otp/send',
  asyncHandler(async (req, res) => {
    res.json(await sendEmailOtp(passwordlessSchema.parse(req.body)))
  }),
)

router.post(
  '/email-otp/verify',
  asyncHandler(async (req, res) => {
    const body = z.object({ otpId: z.string().min(8), code: z.string().length(6) }).parse(req.body)
    res.json(await verifyEmailOtp(body))
  }),
)

router.post(
  '/magic/send',
  asyncHandler(async (req, res) => {
    res.json(await sendMagicLink(passwordlessSchema.parse(req.body)))
  }),
)

router.post(
  '/magic/consume',
  asyncHandler(async (req, res) => {
    const { token } = z.object({ token: z.string().min(16) }).parse(req.body)
    res.json(await consumeMagic(token))
  }),
)

router.post(
  '/oauth/:provider/start',
  asyncHandler(async (req, res) => {
    res.status(501).json({
      error:
        'Google and Apple SSO need client IDs on the API. Passkeys, magic links, and email OTP work on this server now.',
      provider: req.params.provider,
    })
  }),
)

export default router
