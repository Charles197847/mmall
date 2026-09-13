import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../shared/database/index.js'
import { requireAuth, requireVendor } from '../../shared/middleware/auth.js'
import { asyncHandler, HttpError } from '../../shared/middleware/error.js'
import { queue } from '../../shared/queue/index.js'
import { uniqueSlug } from '../../shared/utils/slug.js'
import { asJson, routeParam } from '../../shared/utils/http.js'
import { assertKyc, EXPLORER_PRODUCT_LIMIT, ensureVendorKyc } from '../../shared/kyc.js'

const router = Router()

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPerItem: z.number().optional(),
  inventory: z.number().int().nonnegative().default(0),
  sku: z.string().optional(),
  images: z.array(z.string()).default([]),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().optional(),
  isDigital: z.boolean().optional(),
  weight: z.number().optional(),
  dimensions: z.record(z.unknown()).optional(),
})

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, q, minPrice, maxPrice, vendorId, excludeVendorId, page = '1', limit = '20' } = req.query
    const pageNum = Number(page)
    const limitNum = Number(limit)

    const where: Record<string, unknown> = { isActive: true }

    if (typeof category === 'string' && category) where.category = category
    if (typeof vendorId === 'string' && vendorId) where.vendorId = vendorId
    if (typeof excludeVendorId === 'string' && excludeVendorId) {
      where.vendorId = { not: excludeVendorId }
    }
    if (typeof q === 'string' && q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    const priceFilter: Record<string, number> = {}
    if (typeof minPrice === 'string') priceFilter.gte = parseFloat(minPrice)
    if (typeof maxPrice === 'string') priceFilter.lte = parseFloat(maxPrice)
    if (Object.keys(priceFilter).length) where.price = priceFilter

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: { storeName: true, slug: true, logo: true, city: true, province: true, lat: true, lng: true },
          },
          reviews: { select: { rating: true } },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ])

    const items = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating)
      const rating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
      const { reviews, ...rest } = product
      return {
        ...rest,
        rating,
        reviewCount: reviews.length,
      }
    })

    res.json({ items, total, page: pageNum, limit: limitNum })
  }),
)

router.get(
  '/mine',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const products = await prisma.product.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ items: products, total: products.length, page: 1, limit: products.length })
  }),
)

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: routeParam(req.params.id) },
      include: {
        vendor: {
          select: { storeName: true, slug: true, logo: true, id: true, city: true, province: true, lat: true, lng: true },
        },
        reviews: {
          include: {
            customer: { select: { firstName: true, lastName: true } },
          },
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const rating =
      product.reviews.length === 0
        ? 0
        : product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length

    res.json({ ...product, rating, reviewCount: product.reviews.length })
  }),
)

router.post(
  '/',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const body = productSchema.parse(req.body)
    const kyc = await ensureVendorKyc(vendorId)
    const live = Boolean(body.isActive)
    if (live) {
      await assertKyc(vendorId, 'ACTIVE_VENDOR')
    }
    if (kyc.approvedTier === 'EXPLORER') {
      const count = await prisma.product.count({ where: { vendorId } })
      if (count >= EXPLORER_PRODUCT_LIMIT) {
        throw new HttpError(403, 'Explorer accounts can keep 2 draft listings. Verify to publish more.', {
          code: 'KYC_REQUIRED',
          requiredTier: 'ACTIVE_VENDOR',
          currentTier: 'EXPLORER',
          status: kyc.status,
        })
      }
    }
    const product = await prisma.product.create({
      data: {
        vendorId,
        ...body,
        isActive: live && kyc.approvedTier !== 'EXPLORER',
        dimensions: body.dimensions ? asJson(body.dimensions) : undefined,
        slug: uniqueSlug(body.name),
      },
    })
    await queue.add('search:index-product', { productId: product.id })
    res.status(201).json(product)
  }),
)

router.put(
  '/:id',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const existing = await prisma.product.findFirst({
      where: { id: routeParam(req.params.id), vendorId },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const body = productSchema.partial().parse(req.body)
    if (body.isActive === true) {
      await assertKyc(vendorId, 'ACTIVE_VENDOR')
    }

    const product = await prisma.product.update({
      where: { id: routeParam(req.params.id) },
      data: {
        ...body,
        dimensions: body.dimensions ? asJson(body.dimensions) : undefined,
      },
    })
    await queue.add('search:update-product', { productId: product.id })
    res.json(product)
  }),
)

router.delete(
  '/:id',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorId = req.tenantId!
    const existing = await prisma.product.findFirst({
      where: { id: routeParam(req.params.id), vendorId },
    })
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' })
    }

    await prisma.product.delete({ where: { id: routeParam(req.params.id) } })
    await queue.add('search:delete-product', { productId: routeParam(req.params.id) })
    res.status(204).send()
  }),
)

export default router
