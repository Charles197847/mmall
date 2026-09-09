import { Router } from 'express'
import { z } from 'zod'
import type { AdSlot } from '@prisma/client'
import { prisma } from '../../shared/database/index.js'
import { requireAuth, requireVendor } from '../../shared/middleware/auth.js'
import { asyncHandler, HttpError } from '../../shared/middleware/error.js'
import { readPlatformSettings } from '../../shared/platform-settings.js'
import { campaignStatusForDates, priceForSlot } from '../../shared/ads.js'
import { enqueueJob } from '../../shared/queue/index.js'
import { routeParam } from '../../shared/utils/http.js'

const router = Router()
const slotSchema = z.enum(['HOMEPAGE_BANNER', 'SEARCH_FEATURE', 'SHOP_HIGHLIGHT', 'PUSH_BLAST'])

function toPlacement(campaign: {
  id: string
  slot: AdSlot
  title: string
  headline: string | null
  imageUrl: string | null
  linkUrl: string | null
  vendor: { storeName: string; slug: string }
}) {
  return {
    id: campaign.id,
    slot: campaign.slot,
    title: campaign.title,
    headline: campaign.headline,
    imageUrl: campaign.imageUrl,
    linkUrl: campaign.linkUrl ?? `/(customer)/vendor/${campaign.vendor.slug}`,
    vendorName: campaign.vendor.storeName,
    vendorSlug: campaign.vendor.slug,
  }
}

router.get(
  '/mine',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const items = await prisma.adCampaign.findMany({
      where: { vendorId: req.tenantId! },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ items })
  }),
)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const slot = typeof req.query.slot === 'string' ? slotSchema.parse(req.query.slot) : undefined
    const now = new Date()
    await prisma.adCampaign.updateMany({
      where: { status: 'SCHEDULED', startsAt: { lte: now }, endsAt: { gt: now } },
      data: { status: 'ACTIVE' },
    })
    await prisma.adCampaign.updateMany({
      where: { status: { in: ['ACTIVE', 'SCHEDULED'] }, endsAt: { lte: now } },
      data: { status: 'ENDED' },
    })

    const items = await prisma.adCampaign.findMany({
      where: {
        status: 'ACTIVE',
        startsAt: { lte: now },
        endsAt: { gt: now },
        ...(slot ? { slot } : { slot: { not: 'PUSH_BLAST' } }),
      },
      include: { vendor: { select: { storeName: true, slug: true, logo: true } } },
      orderBy: { impressions: 'asc' },
      take: 6,
    })
    res.json({ items: items.map(toPlacement) })
  }),
)

router.post(
  '/:id/impression',
  asyncHandler(async (req, res) => {
    const id = routeParam(req.params.id)
    await prisma.$transaction([
      prisma.adCampaign.update({
        where: { id },
        data: { impressions: { increment: 1 } },
      }),
      prisma.adEvent.create({ data: { campaignId: id, type: 'IMPRESSION' } }),
    ])
    res.json({ ok: true })
  }),
)

router.post(
  '/:id/click',
  asyncHandler(async (req, res) => {
    const id = routeParam(req.params.id)
    await prisma.$transaction([
      prisma.adCampaign.update({
        where: { id },
        data: { clicks: { increment: 1 } },
      }),
      prisma.adEvent.create({ data: { campaignId: id, type: 'CLICK' } }),
    ])
    res.json({ ok: true })
  }),
)

router.post(
  '/',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const body = z
      .object({
        slot: slotSchema,
        title: z.string().min(3).max(80),
        headline: z.string().max(160).optional(),
        imageUrl: z.string().url().optional(),
        linkUrl: z.string().min(1).optional(),
        startsAt: z.coerce.date(),
        endsAt: z.coerce.date(),
        audienceSize: z.number().int().min(1000).max(200000).optional(),
      })
      .parse(req.body)
    const startsAt = body.startsAt
    const endsAt = body.endsAt
    if (endsAt <= startsAt) {
      throw new HttpError(400, 'Campaign end must be after start')
    }
    const vendor = await prisma.vendor.findUniqueOrThrow({ where: { id: vendorId } })
    const settings = readPlatformSettings()
    const price = priceForSlot(body.slot, settings, {
      startsAt,
      endsAt,
      audienceSize: body.audienceSize,
    })
    const campaign = await prisma.adCampaign.create({
      data: {
        vendorId,
        slot: body.slot,
        title: body.title,
        headline: body.headline,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl ?? `/(customer)/vendor/${vendor.slug}`,
        startsAt,
        endsAt,
        price,
        audienceSize: body.slot === 'PUSH_BLAST' ? (body.audienceSize ?? settings.pushBlastAudience) : null,
      },
    })
    res.status(201).json(campaign)
  }),
)

router.post(
  '/:id/purchase',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const campaign = await prisma.adCampaign.findFirst({
      where: { id: routeParam(req.params.id), vendorId },
    })
    if (!campaign) throw new HttpError(404, 'Campaign not found')
    if (campaign.status !== 'DRAFT') throw new HttpError(400, 'Campaign already purchased')

    const status = campaignStatusForDates(campaign.startsAt, campaign.endsAt)
    const updated = await prisma.adCampaign.update({
      where: { id: campaign.id },
      data: { status },
    })

    if (campaign.slot === 'PUSH_BLAST') {
      const delay = Math.max(0, campaign.startsAt.getTime() - Date.now())
      await enqueueJob('notification:broadcast', { campaignId: campaign.id }, { delay })
    }

    res.json(updated)
  }),
)

export default router
