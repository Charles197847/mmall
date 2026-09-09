import Stripe from 'stripe'
import { prisma } from '../../shared/database/index.js'
import { queue } from '../../shared/queue/index.js'

const stripeSecret = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeSecret, {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
})

export async function createVendorStripeAccount(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { user: true },
  })

  if (!vendor) throw new Error('Vendor not found')

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      account: { id: `acct_placeholder_${vendorId}` },
      onboardingUrl: `${process.env.VENDOR_DASHBOARD_URL ?? 'http://localhost:3001'}/onboarding/complete`,
    }
  }

  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    email: vendor.user.email,
    business_type: 'individual',
    business_profile: {
      name: vendor.storeName,
      url: `${process.env.FRONTEND_URL ?? 'https://shopping-mall.com'}/store/${vendor.slug}`,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    settings: {
      payouts: {
        schedule: {
          interval: 'weekly',
          weekly_anchor: 'monday',
        },
      },
    },
  })

  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.VENDOR_DASHBOARD_URL}/onboarding/refresh`,
    return_url: `${process.env.VENDOR_DASHBOARD_URL}/onboarding/complete`,
    type: 'account_onboarding',
  })

  await prisma.vendor.update({
    where: { id: vendorId },
    data: { stripeAccountId: account.id },
  })

  return { account, onboardingUrl: accountLink.url }
}

export async function processPayment(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { vendor: true } },
      vendorOrders: { include: { vendor: true } },
    },
  })

  if (!order) throw new Error('Order not found')

  if (!process.env.STRIPE_SECRET_KEY) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentIntentId: `pi_placeholder_${orderId}` },
    })
    return { clientSecret: `pi_placeholder_${orderId}_secret`, paymentIntentId: `pi_placeholder_${orderId}` }
  }

  const transferGroup = `order_${order.id}`
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'usd',
    transfer_group: transferGroup,
    metadata: { order_id: order.id },
  })

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentIntentId: paymentIntent.id },
  })

  return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }
}

export async function createVendorTransfers(orderId: string) {
  const vendorOrders = await prisma.vendorOrder.findMany({
    where: { orderId },
    include: { vendor: true },
  })

  for (const vendorOrder of vendorOrders) {
    if (!vendorOrder.vendor.stripeAccountId || !process.env.STRIPE_SECRET_KEY) continue
    await stripe.transfers.create({
      amount: Math.round(vendorOrder.payoutAmount * 100),
      currency: 'usd',
      destination: vendorOrder.vendor.stripeAccountId,
      transfer_group: `order_${orderId}`,
      metadata: { vendor_order_id: vendorOrder.id },
    })
  }
}

export async function handleWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      const orderId = paymentIntent.metadata.order_id
      if (!orderId) break

      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'PROCESSING' },
      })
      await prisma.vendorOrder.updateMany({
        where: { orderId },
        data: { status: 'PROCESSING' },
      })
      await createVendorTransfers(orderId)
      await queue.add('notification:payment-confirmed', { orderId })
      await queue.add('order:fulfillment', { orderId })
      break
    }
    case 'account.updated': {
      const account = event.data.object as Stripe.Account
      if (account.charges_enabled) {
        await prisma.vendor.updateMany({
          where: { stripeAccountId: account.id },
          data: { isActive: true },
        })
      }
      break
    }
    default:
      break
  }
}
