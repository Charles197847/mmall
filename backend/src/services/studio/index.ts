import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../shared/database/index.js'
import { requireAuth, requireVendor } from '../../shared/middleware/auth.js'
import { asyncHandler, HttpError } from '../../shared/middleware/error.js'
import { readPlatformSettings } from '../../shared/platform-settings.js'
import { consumeGenerationQuota, quotaSnapshot } from '../../shared/generation.js'
import { generateAssetImage } from './provider.js'
import { assertKyc } from '../../shared/kyc.js'

const router = Router()
const assetTypeSchema = z.enum(['LOGO', 'BANNER'])

router.use(requireAuth, requireVendor)

router.get(
  '/quota',
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const settings = readPlatformSettings()
    const rows = await prisma.generationUsage.findMany({ where: { vendorId } })
    const byType = Object.fromEntries(rows.map((row) => [row.assetType, row]))
    res.json({
      items: (['LOGO', 'BANNER'] as const).map((assetType) =>
        quotaSnapshot(
          assetType,
          byType[assetType] ?? { freeUsed: 0, paidCredits: 0 },
          settings,
        ),
      ),
    })
  }),
)

router.get(
  '/jobs',
  asyncHandler(async (req, res) => {
    const items = await prisma.generationJob.findMany({
      where: { vendorId: req.tenantId! },
      orderBy: { createdAt: 'desc' },
      take: 24,
    })
    res.json({ items })
  }),
)

router.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const body = z
      .object({
        assetType: assetTypeSchema,
        prompt: z.string().min(8).max(800),
      })
      .parse(req.body)
    const settings = readPlatformSettings()
    const usage = await prisma.generationUsage.upsert({
      where: { vendorId_assetType: { vendorId, assetType: body.assetType } },
      create: { vendorId, assetType: body.assetType },
      update: {},
    })
    const preview = consumeGenerationQuota(usage)
    if (preview.billedAs === 'PAID') {
      await assertKyc(vendorId, 'ACTIVE_VENDOR')
    }

    const reservation = await prisma.$transaction(async (tx) => {
      const usage = await tx.generationUsage.upsert({
        where: { vendorId_assetType: { vendorId, assetType: body.assetType } },
        create: { vendorId, assetType: body.assetType },
        update: {},
      })
      const decision = consumeGenerationQuota(usage)
      if (decision.billedAs === 'BLOCKED') {
        throw new HttpError(402, 'Generation quota exceeded', {
          code: 'QUOTA_EXCEEDED',
          assetType: body.assetType,
          unitPrice: body.assetType === 'LOGO' ? settings.logoGenerationPrice : settings.bannerGenerationPrice,
          freeLimit: 5,
        })
      }
      await tx.generationUsage.update({
        where: { id: usage.id },
        data: decision.next,
      })
      return decision
    })

    try {
      const image = await generateAssetImage(body.prompt, body.assetType)
      const job = await prisma.generationJob.create({
        data: {
          vendorId,
          assetType: body.assetType,
          prompt: body.prompt,
          imageUrl: image.url,
          provider: image.provider,
          billedAs: reservation.billedAs,
        },
      })
      const usage = await prisma.generationUsage.findUniqueOrThrow({
        where: { vendorId_assetType: { vendorId, assetType: body.assetType } },
      })
      res.status(201).json({
        job,
        quota: quotaSnapshot(body.assetType, usage, settings),
      })
    } catch (error) {
      await prisma.generationUsage.update({
        where: { vendorId_assetType: { vendorId, assetType: body.assetType } },
        data:
          reservation.billedAs === 'FREE'
            ? { freeUsed: { decrement: 1 } }
            : { paidCredits: { increment: 1 } },
      })
      throw error
    }
  }),
)

router.post(
  '/topup',
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    await assertKyc(vendorId, 'ACTIVE_VENDOR')
    const body = z
      .object({
        assetType: assetTypeSchema,
        quantity: z.number().int().min(1).max(20),
      })
      .parse(req.body)
    const settings = readPlatformSettings()
    const unitPrice = body.assetType === 'LOGO' ? settings.logoGenerationPrice : settings.bannerGenerationPrice
    const usage = await prisma.generationUsage.upsert({
      where: { vendorId_assetType: { vendorId, assetType: body.assetType } },
      create: { vendorId, assetType: body.assetType, paidCredits: body.quantity },
      update: { paidCredits: { increment: body.quantity } },
    })
    res.json({
      quota: quotaSnapshot(body.assetType, usage, settings),
      charged: unitPrice * body.quantity,
      currency: settings.currency,
    })
  }),
)

router.post(
  '/apply',
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const body = z
      .object({
        jobId: z.string().min(1),
      })
      .parse(req.body)
    const job = await prisma.generationJob.findFirst({
      where: { id: body.jobId, vendorId },
    })
    if (!job) {
      throw new HttpError(404, 'Generation not found')
    }
    const vendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: job.assetType === 'LOGO' ? { logo: job.imageUrl } : { coverImage: job.imageUrl },
    })
    res.json({ vendor, job })
  }),
)

export default router
