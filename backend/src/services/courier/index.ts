import { prisma } from '../../shared/database/index.js'
import { HttpError } from '../../shared/middleware/error.js'
import { asJson } from '../../shared/utils/http.js'
import { pickQuote } from './pick.js'
import { quoteCourierGuy, type AddressInput, type CourierServiceCode, type ShippingQuote } from './quotes.js'

export { pickQuote, quoteCourierGuy }
export type { AddressInput, CourierServiceCode, ShippingQuote }

const NEXT_STATUS: Record<string, 'COLLECTED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | null> = {
  BOOKED: 'COLLECTED',
  COLLECTED: 'IN_TRANSIT',
  IN_TRANSIT: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
  DELIVERED: null,
  FAILED: null,
}

function trackingNumber() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 5; i += 1) suffix += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `CG${suffix}`
}

function event(status: string, description: string) {
  return { status, description, at: new Date().toISOString(), location: 'The Courier Guy hub' }
}

export async function quoteForCart(items: Array<{ productId: string; quantity: number }>, delivery: AddressInput) {
  const deliveryCity = delivery.city ?? ''
  if (!deliveryCity) throw new HttpError(400, 'City is required for a Courier Guy quote')

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) } },
    include: { vendor: { select: { city: true } } },
  })
  if (!products.length) throw new HttpError(400, 'No products found for shipping quote')

  let weightKg = 0
  for (const item of items) {
    const product = products.find((row) => row.id === item.productId)
    if (!product) continue
    weightKg += (product.weight ?? 0.8) * item.quantity
  }

  const collectionCity = products.find((product) => product.vendor?.city)?.vendor?.city ?? 'Johannesburg'
  const quotes = quoteCourierGuy({ collectionCity, deliveryCity, weightKg })
  return {
    carrier: 'THE_COURIER_GUY' as const,
    collectionCity,
    deliveryCity,
    weightKg: Math.round(weightKg * 100) / 100,
    quotes,
  }
}

export async function bookVendorShipment(
  vendorOrderId: string,
  serviceLevelCode: CourierServiceCode,
  delivery: AddressInput,
) {
  const vendorOrder = await prisma.vendorOrder.findUnique({
    where: { id: vendorOrderId },
    include: {
      vendor: true,
      order: { include: { items: { include: { product: true } } } },
      shipments: true,
    },
  })
  if (!vendorOrder) throw new HttpError(404, 'Vendor order not found')
  if (vendorOrder.order.paymentStatus !== 'PAID') {
    throw new HttpError(400, 'Pay with PayGate before booking The Courier Guy')
  }
  if (vendorOrder.shipments.length) return vendorOrder.shipments[0]

  const weightKg = vendorOrder.order.items
    .filter((item) => item.vendorId === vendorOrder.vendorId)
    .reduce((sum, item) => sum + (item.product.weight ?? 0.8) * item.quantity, 0)
  const quotes = quoteCourierGuy({
    collectionCity: 'Johannesburg',
    deliveryCity: String(delivery.city ?? 'Johannesburg'),
    weightKg,
  })
  const quote = pickQuote(quotes, serviceLevelCode)
  const tracking = trackingNumber()
  const shipment = await prisma.shipment.create({
    data: {
      vendorOrderId,
      carrier: 'THE_COURIER_GUY',
      serviceLevelCode: quote.serviceLevelCode,
      serviceName: quote.serviceName,
      trackingNumber: tracking,
      amount: quote.amount,
      status: 'BOOKED',
      collectionAddress: asJson({
        company: vendorOrder.vendor.storeName,
        street_address: 'MMall vendor hub, 90 Rivonia Road',
        city: 'Sandton',
        code: '2196',
        country: 'South Africa',
      }),
      deliveryAddress: asJson(delivery),
      estimatedDays: quote.estimatedDays,
      events: asJson([event('BOOKED', `Waybill ${tracking} created. Courier Guy will collect from the Sandton hub.`)]),
    },
  })
  await prisma.vendorOrder.update({
    where: { id: vendorOrderId },
    data: {
      shippingCarrier: 'The Courier Guy',
      trackingNumber: tracking,
      status: vendorOrder.status === 'PENDING' ? 'PROCESSING' : vendorOrder.status,
    },
  })
  return shipment
}

export async function advanceShipment(shipmentId: string) {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } })
  if (!shipment) throw new HttpError(404, 'Shipment not found')
  const next = NEXT_STATUS[shipment.status]
  if (!next) return shipment

  const descriptions: Record<string, string> = {
    COLLECTED: 'Parcel scanned at collection. The Courier Guy has the bag.',
    IN_TRANSIT: 'Linehaul to destination depot.',
    OUT_FOR_DELIVERY: 'Out for delivery with the courier guy.',
    DELIVERED: 'Delivered and signed for.',
  }
  const events = Array.isArray(shipment.events) ? shipment.events : []
  const updated = await prisma.shipment.update({
    where: { id: shipmentId },
    data: {
      status: next,
      events: asJson([...events, event(next, descriptions[next])]),
    },
  })
  if (next === 'COLLECTED') {
    await prisma.vendorOrder.update({
      where: { id: shipment.vendorOrderId },
      data: { status: 'SHIPPED', shippedAt: new Date() },
    })
  }
  if (next === 'DELIVERED') {
    await prisma.vendorOrder.update({
      where: { id: shipment.vendorOrderId },
      data: { status: 'DELIVERED', deliveredAt: new Date() },
    })
  }
  return updated
}
