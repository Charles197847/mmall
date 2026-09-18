import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../shared/database/index.js'
import { requireAuth, requireVendor } from '../../shared/middleware/auth.js'
import { asyncHandler } from '../../shared/middleware/error.js'
import { queue } from '../../shared/queue/index.js'
import { asJson, routeParam } from '../../shared/utils/http.js'
import { settleVendorSale } from '../../shared/fees.js'
import { readPlatformSettings } from '../../shared/platform-settings.js'
import { initiatePaygate } from '../paygate/index.js'
import { pickQuote, quoteForCart } from '../courier/index.js'
import { publishGrid } from '../../shared/events.js'

const router = Router()

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1),
  shippingAddress: z.record(z.unknown()),
  billingAddress: z.record(z.unknown()).optional(),
  shippingServiceCode: z.enum(['ECO', 'OVN', 'SDD']).default('ECO'),
  paymentReturnUrl: z.string().min(8).max(400).optional(),
})

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const customerId = req.user!.id
    const { items, shippingAddress, billingAddress, shippingServiceCode, paymentReturnUrl } =
      createOrderSchema.parse(req.body)

    const fees = readPlatformSettings()
    const vendorGroups = new Map<
      string,
      {
        vendorId: string
        items: Array<{
          productId: string
          quantity: number
          price: number
          total: number
          category: string | null
        }>
        subtotal: number
      }
    >()

    let subtotal = 0

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { vendor: true },
      })

      if (!product || !product.isActive) {
        return res.status(400).json({ error: `Product ${item.productId} not available` })
      }
      if (product.inventory < item.quantity) {
        return res.status(400).json({ error: `Insufficient inventory for ${product.name}` })
      }

      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      if (!vendorGroups.has(product.vendorId)) {
        vendorGroups.set(product.vendorId, {
          vendorId: product.vendorId,
          items: [],
          subtotal: 0,
        })
      }

      const group = vendorGroups.get(product.vendorId)!
      group.items.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        category: product.category,
      })
      group.subtotal += itemTotal
    }

    const shippingQuote = await quoteForCart(
      items,
      shippingAddress as { city?: string; postalCode?: string; street?: string; line1?: string },
    )
    const selectedShipping = pickQuote(shippingQuote.quotes, shippingServiceCode)
    const shippingTotal = selectedShipping.amount

    const vendorOrders = Array.from(vendorGroups.values()).map((group) => {
      const settlement = settleVendorSale({
        items: group.items,
        orderTotal: subtotal,
        settings: fees,
      })
      return {
        vendorId: group.vendorId,
        ...settlement,
        items: group.items,
      }
    })

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customerId,
          totalAmount: subtotal + shippingTotal,
          subtotal,
          shippingTotal,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          shippingAddress: asJson({
            ...shippingAddress,
            shippingServiceCode,
            shippingServiceName: selectedShipping.serviceName,
            carrier: 'THE_COURIER_GUY',
          }),
          billingAddress: asJson(billingAddress ?? shippingAddress),
        },
      })

      for (const group of vendorOrders) {
        for (const item of group.items) {
          await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: item.productId,
              vendorId: group.vendorId,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            },
          })
        }

        await tx.vendorOrder.create({
          data: {
            orderId: newOrder.id,
            vendorId: group.vendorId,
            subtotal: group.subtotal,
            commission: group.commission,
            gatewayFee: group.gatewayFee,
            feeBreakdown: asJson({
              subtotal: group.subtotal,
              commission: group.commission,
              commissionRate: group.commissionRate,
              gatewayFee: group.gatewayFee,
              payoutAmount: group.payoutAmount,
            }),
            payoutAmount: group.payoutAmount,
            status: 'PENDING',
          },
        })
      }

      return newOrder
    })

    await queue.add('notification:order-confirmation', { orderId: order.id })
    await queue.add('notification:vendor-order', { orderId: order.id })
    publishGrid({ type: 'order', payload: { orderId: order.id } })
    const paygate = await initiatePaygate(order.id, paymentReturnUrl)

    res.status(201).json({ ...order, shippingTotal, paygate })
  }),
)

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user!.role === 'VENDOR' && req.tenantId) {
      const vendorOrders = await prisma.vendorOrder.findMany({
        where: { vendorId: req.tenantId },
        include: {
          order: {
            include: {
              items: {
                where: { vendorId: req.tenantId },
                include: { product: true },
              },
              customer: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          shipments: true,
        },
        orderBy: { order: { createdAt: 'desc' } },
      })
      return res.json(vendorOrders)
    }

    const orders = await prisma.order.findMany({
      where: { customerId: req.user!.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: { select: { storeName: true, slug: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(orders)
  }),
)

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findFirst({
      where:
        req.user!.role === 'ADMIN'
          ? { id: routeParam(req.params.id) }
          : { id: routeParam(req.params.id), customerId: req.user!.id },
      include: {
        items: {
          include: {
            product: { include: { vendor: true } },
          },
        },
        vendorOrders: { include: { vendor: true, shipments: true } },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  }),
)

router.patch(
  '/:id/status',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const status = z
      .enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
      .parse(req.body.status)

    const vendorOrder = await prisma.vendorOrder.findFirst({
      where: { orderId: routeParam(req.params.id), vendorId: req.tenantId },
    })
    if (!vendorOrder) {
      return res.status(404).json({ error: 'Vendor order not found' })
    }

    const updated = await prisma.vendorOrder.update({
      where: { id: vendorOrder.id },
      data: {
        status,
        shippedAt: status === 'SHIPPED' ? new Date() : vendorOrder.shippedAt,
        deliveredAt: status === 'DELIVERED' ? new Date() : vendorOrder.deliveredAt,
        trackingNumber: req.body.trackingNumber ?? vendorOrder.trackingNumber,
        shippingCarrier: req.body.shippingCarrier ?? vendorOrder.shippingCarrier,
      },
    })

    res.json(updated)
  }),
)

export default router
