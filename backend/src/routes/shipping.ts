import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireVendor } from '../shared/middleware/auth.js'
import { asyncHandler, HttpError } from '../shared/middleware/error.js'
import { prisma } from '../shared/database/index.js'
import { routeParam } from '../shared/utils/http.js'
import { advanceShipment, bookVendorShipment, quoteForCart } from '../services/courier/index.js'
import type { CourierServiceCode } from '../services/courier/quotes.js'

const router = Router()
const serviceSchema = z.enum(['ECO', 'OVN', 'SDD'])

router.post(
  '/quote',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).min(1),
        address: z.object({
          city: z.string().min(2),
          postalCode: z.string().optional(),
          state: z.string().optional(),
          line1: z.string().optional(),
          street: z.string().optional(),
          country: z.string().optional(),
        }),
      })
      .parse(req.body)
    res.json(await quoteForCart(body.items, body.address))
  }),
)

router.post(
  '/vendor-orders/:id/book',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const vendorOrder = await prisma.vendorOrder.findFirst({
      where: { id: routeParam(req.params.id), vendorId: req.tenantId },
      include: { order: true },
    })
    if (!vendorOrder) throw new HttpError(404, 'Vendor order not found')
    const delivery = (vendorOrder.order.shippingAddress ?? {}) as Record<string, string>
    const serviceLevelCode = serviceSchema.parse(
      req.body.serviceLevelCode ?? delivery.shippingServiceCode ?? 'ECO',
    ) as CourierServiceCode
    const shipment = await bookVendorShipment(vendorOrder.id, serviceLevelCode, delivery)
    res.status(201).json(shipment)
  }),
)

router.post(
  '/:id/advance',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const shipment = await prisma.shipment.findFirst({
      where: { id: routeParam(req.params.id), vendorOrder: { vendorId: req.tenantId } },
    })
    if (!shipment) throw new HttpError(404, 'Shipment not found')
    res.json(await advanceShipment(shipment.id))
  }),
)

router.get(
  '/track/:trackingNumber',
  asyncHandler(async (req, res) => {
    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber: String(req.params.trackingNumber) },
    })
    if (!shipment) throw new HttpError(404, 'Waybill not found')
    res.json(shipment)
  }),
)

export default router
