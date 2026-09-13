import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../shared/database/index.js'
import { requireAdmin, requireAuth } from '../shared/middleware/auth.js'
import { asyncHandler } from '../shared/middleware/error.js'
import { readPlatformSettings, writePlatformSettings } from '../shared/platform-settings.js'
import { routeParam } from '../shared/utils/http.js'

const router = Router()

router.use(requireAuth, requireAdmin)

function percentChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

router.get(
  '/vendors',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : 'all'
    const where =
      status === 'pending'
        ? { isApproved: false }
        : status === 'approved'
          ? { isApproved: true, isActive: true }
          : status === 'suspended'
            ? { isApproved: true, isActive: false }
            : {}

    const vendors = await prisma.vendor.findMany({
      where,
      include: { user: { select: { email: true, firstName: true, lastName: true } }, kyc: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(vendors)
  }),
)

router.post(
  '/vendors/:id/approve',
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.update({
      where: { id: routeParam(req.params.id) },
      data: { isApproved: true, isActive: true },
    })
    res.json(vendor)
  }),
)

router.post(
  '/vendors/:id/suspend',
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.update({
      where: { id: routeParam(req.params.id) },
      data: { isActive: false },
    })
    res.json(vendor)
  }),
)

router.post(
  '/vendors/:id/unsuspend',
  asyncHandler(async (req, res) => {
    const vendor = await prisma.vendor.update({
      where: { id: routeParam(req.params.id) },
      data: { isActive: true },
    })
    res.json(vendor)
  }),
)

router.put(
  '/vendors/:id/commission',
  asyncHandler(async (req, res) => {
    const { commissionRate } = z
      .object({ commissionRate: z.number().min(0).max(100) })
      .parse(req.body)
    const vendor = await prisma.vendor.update({
      where: { id: routeParam(req.params.id) },
      data: { commissionRate },
    })
    res.json(vendor)
  }),
)

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

    const [
      totalOrders,
      activeVendors,
      pendingVendors,
      totalProducts,
      revenue,
      recentOrders,
      ordersThisWeek,
      ordersLastWeek,
      revenueThisWeek,
      revenueLastWeek,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.vendor.count({ where: { isActive: true, isApproved: true } }),
      prisma.vendor.count({ where: { isApproved: false } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        include: {
          customer: { select: { email: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.order.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: weekAgo } },
        _sum: { totalAmount: true },
      }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID', createdAt: { gte: twoWeeksAgo, lt: weekAgo } },
        _sum: { totalAmount: true },
      }),
    ])

    res.json({
      totalRevenue: revenue._sum.totalAmount ?? 0,
      revenueGrowth: percentChange(revenueThisWeek._sum.totalAmount ?? 0, revenueLastWeek._sum.totalAmount ?? 0),
      totalOrders,
      orderGrowth: percentChange(ordersThisWeek, ordersLastWeek),
      activeVendors,
      pendingVendors,
      totalProducts,
      recentOrders,
    })
  }),
)

router.get(
  '/stats/revenue',
  asyncHandler(async (_req, res) => {
    const since = new Date()
    since.setDate(since.getDate() - 29)
    since.setHours(0, 0, 0, 0)

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, totalAmount: true, paymentStatus: true },
      orderBy: { createdAt: 'asc' },
    })

    const byDay = new Map<string, number>()
    for (let i = 29; i >= 0; i -= 1) {
      const day = new Date()
      day.setDate(day.getDate() - i)
      byDay.set(day.toISOString().slice(0, 10), 0)
    }
    for (const order of orders) {
      const key = order.createdAt.toISOString().slice(0, 10)
      byDay.set(key, (byDay.get(key) ?? 0) + order.totalAmount)
    }

    res.json(Array.from(byDay, ([date, totalAmount]) => ({ date, createdAt: date, totalAmount })))
  }),
)

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    res.json(readPlatformSettings())
  }),
)

router.put(
  '/settings',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        defaultCommission: z.number().min(0).max(100),
        minPayoutAmount: z.number().min(0),
        currency: z.enum(['USD', 'EUR', 'ZAR', 'GBP']),
        shippingDefault: z.number().min(0),
        monthlyPlatformFee: z.number().min(0),
        gatewayPercent: z.number().min(0).max(100),
        gatewayFixed: z.number().min(0),
        withdrawalFee: z.number().min(0),
        categoryCommissions: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              rate: z.number().min(0).max(100),
              match: z.array(z.string()),
              examples: z.string(),
            }),
          )
          .min(1),
        logoGenerationPrice: z.number().min(0),
        bannerGenerationPrice: z.number().min(0),
        homepageBannerWeeklyPrice: z.number().min(0),
        searchFeatureWeeklyPrice: z.number().min(0),
        shopHighlightWeeklyPrice: z.number().min(0),
        pushBlastMinPrice: z.number().min(0),
        pushBlastMaxPrice: z.number().min(0),
        pushBlastAudience: z.number().int().min(1),
      })
      .parse(req.body)
    res.json(writePlatformSettings(body))
  }),
)

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' && req.query.status !== 'all' ? req.query.status : undefined
    const orders = await prisma.order.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        customer: { select: { email: true, firstName: true, lastName: true } },
        items: { include: { product: { select: { name: true } } } },
        vendorOrders: { include: { vendor: { select: { storeName: true, slug: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(orders)
  }),
)

router.patch(
  '/orders/:id/status',
  asyncHandler(async (req, res) => {
    const status = z
      .enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
      .parse(req.body.status)

    const order = await prisma.order.update({
      where: { id: routeParam(req.params.id) },
      data: { status },
    })

    if (status === 'CANCELLED' || status === 'REFUNDED') {
      await prisma.vendorOrder.updateMany({
        where: { orderId: order.id },
        data: { status: 'CANCELLED' },
      })
    }

    res.json(order)
  }),
)

router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        vendorProfile: { select: { storeName: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  }),
)

router.patch(
  '/users/:id/role',
  asyncHandler(async (req, res) => {
    const role = z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']).parse(req.body.role)
    const userId = routeParam(req.params.id)

    if (role !== 'ADMIN') {
      const admins = await prisma.user.count({ where: { role: 'ADMIN' } })
      const current = await prisma.user.findUnique({ where: { id: userId } })
      if (current?.role === 'ADMIN' && admins <= 1) {
        return res.status(400).json({ error: 'Cannot demote the last admin' })
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    })
    res.json(user)
  }),
)

router.get(
  '/ads',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' && req.query.status !== 'all' ? req.query.status : undefined
    const items = await prisma.adCampaign.findMany({
      where: status ? { status: status as never } : undefined,
      include: { vendor: { select: { storeName: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ items })
  }),
)

export default router
