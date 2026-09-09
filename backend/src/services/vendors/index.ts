import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../shared/database/index.js'
import { requireAuth, requireAdmin, requireVendor } from '../../shared/middleware/auth.js'
import { asyncHandler } from '../../shared/middleware/error.js'
import { queue } from '../../shared/queue/index.js'
import { toSlug } from '../../shared/utils/slug.js'
import { asJson, routeParam } from '../../shared/utils/http.js'
import { readPlatformSettings } from '../../shared/platform-settings.js'

const router = Router()

const onboardSchema = z.object({
  storeName: z.string().min(2),
  description: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
})

router.get(
  '/store/pricing',
  requireAuth,
  requireVendor,
  asyncHandler(async (_req, res) => {
    res.json(readPlatformSettings())
  }),
)

router.get(
  '/store/analytics',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenantId!
    const since = new Date()
    since.setDate(since.getDate() - 6)
    since.setHours(0, 0, 0, 0)

    const [orders, products, revenue, pendingOrders, recent] = await Promise.all([
      prisma.vendorOrder.count({ where: { vendorId: tenantId } }),
      prisma.product.count({ where: { vendorId: tenantId } }),
      prisma.vendorOrder.aggregate({
        where: { vendorId: tenantId, status: 'DELIVERED' },
        _sum: { payoutAmount: true },
      }),
      prisma.vendorOrder.count({
        where: { vendorId: tenantId, status: { in: ['PENDING', 'PROCESSING'] } },
      }),
      prisma.vendorOrder.findMany({
        where: { vendorId: tenantId, order: { createdAt: { gte: since } } },
        include: { order: { select: { createdAt: true } } },
      }),
    ])

    const salesByDay = new Map<string, number>()
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      salesByDay.set(day.toISOString().slice(0, 10), 0)
    }
    for (const row of recent) {
      const key = row.order.createdAt.toISOString().slice(0, 10)
      salesByDay.set(key, (salesByDay.get(key) ?? 0) + row.payoutAmount)
    }

    res.json({
      totalOrders: orders,
      totalProducts: products,
      totalRevenue: revenue._sum.payoutAmount ?? 0,
      pendingOrders,
      salesTrend: Array.from(salesByDay, ([date, sales]) => ({ date, sales })),
    })
  }),
)

router.put(
  '/store',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const tenantId = req.tenantId!
    const vendor = await prisma.vendor.update({
      where: { id: tenantId },
      data: {
        storeName: req.body.storeName,
        description: req.body.description,
        logo: req.body.logo,
        coverImage: req.body.coverImage,
        settings: req.body.settings ? asJson(req.body.settings) : undefined,
      },
    })
    res.json(vendor)
  }),
)

router.post(
  '/onboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id
    const body = onboardSchema.parse(req.body)

    const existing = await prisma.vendor.findUnique({ where: { userId } })
    if (existing) {
      return res.status(400).json({ error: 'User already has a vendor account' })
    }

    const slug = toSlug(body.storeName)
    const vendor = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: 'VENDOR' },
      })
      const { defaultCommission } = readPlatformSettings()
      return tx.vendor.create({
        data: {
          userId,
          storeName: body.storeName,
          slug,
          description: body.description,
          commissionRate: defaultCommission,
          settings: body.settings ? asJson(body.settings) : undefined,
        },
      })
    })

    await queue.add('vendor:create-stripe-account', { vendorId: vendor.id })
    res.status(201).json(vendor)
  }),
)

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const vendors = await prisma.vendor.findMany({
      where: { isActive: true, isApproved: true },
      select: {
        id: true,
        storeName: true,
        slug: true,
        description: true,
        logo: true,
        coverImage: true,
      },
    })
    res.json(vendors)
  }),
)

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.findUnique({
      where: { slug: routeParam(req.params.slug) },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!vendor || !vendor.isActive) {
      return res.status(404).json({ error: 'Vendor not found' })
    }

    res.json(vendor)
  }),
)

router.post(
  '/:id/approve',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.update({
      where: { id: routeParam(req.params.id) },
      data: { isApproved: true, isActive: true },
    })
    res.json(vendor)
  }),
)

router.post(
  '/:id/suspend',
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.update({
      where: { id: routeParam(req.params.id) },
      data: { isActive: false },
    })
    res.json(vendor)
  }),
)

export default router
