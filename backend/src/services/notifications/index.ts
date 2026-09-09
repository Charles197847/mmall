import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../shared/database/index.js'
import { requireAuth } from '../../shared/middleware/auth.js'
import { asyncHandler } from '../../shared/middleware/error.js'
import { registerJob } from '../../shared/queue/index.js'
import { asJson } from '../../shared/utils/http.js'

const router = Router()

async function sendFcm(tokens: string[], title: string, body: string, data: Record<string, string>) {
  const key = process.env.FIREBASE_SERVER_KEY ?? process.env.FCM_SERVER_KEY
  const realTokens = tokens.filter((token) => !token.startsWith('mmall:') && !token.startsWith('web:'))
  if (!key) {
    console.log('FCM not configured — stored in-app notifications only', { title, devices: tokens.length })
    return { sent: 0 }
  }
  if (!realTokens.length) return { sent: 0 }

  let sent = 0
  for (let i = 0; i < realTokens.length; i += 500) {
    const batch = realTokens.slice(i, i + 500)
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: batch,
        notification: { title, body },
        data,
        priority: 'high',
      }),
    })
    if (!response.ok) {
      console.warn('FCM batch failed', await response.text())
      continue
    }
    sent += batch.length
  }
  return { sent }
}

export async function broadcastCampaign(campaignId: string) {
  const campaign = await prisma.adCampaign.findUnique({
    where: { id: campaignId },
    include: { vendor: { select: { storeName: true, slug: true } } },
  })
  if (!campaign) return { sent: 0 }

  const title = campaign.title
  const body = campaign.headline ?? `${campaign.vendor.storeName} has a new offer on MMall.`
  const payload = {
    campaignId: campaign.id,
    vendorSlug: campaign.vendor.slug,
    slot: campaign.slot,
  }

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    select: { id: true },
  })
  if (customers.length) {
    await prisma.notification.createMany({
      data: customers.map((customer) => ({
        userId: customer.id,
        title,
        body,
        data: asJson(payload),
      })),
    })
  }

  const devices = await prisma.deviceToken.findMany({ select: { token: true } })
  const fcm = await sendFcm(
    devices.map((device) => device.token),
    title,
    body,
    Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value)])),
  )
  console.log('Push blast delivered', { campaignId, inApp: customers.length, fcm: fcm.sent })
  return { inApp: customers.length, fcm: fcm.sent }
}

registerJob('notification:order-confirmation', async (job) => {
  console.log('Order confirmation', job.data)
})

registerJob('notification:vendor-order', async (job) => {
  console.log('Vendor order notification', job.data)
})

registerJob('notification:payment-confirmed', async (job) => {
  console.log('Payment confirmed', job.data)
})

registerJob('notification:broadcast', async (job) => {
  await broadcastCampaign(String(job.data.campaignId))
})

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json({ items })
  }),
)

router.post(
  '/devices',
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        token: z.string().min(8).max(512),
        platform: z.string().min(2).max(32).default('web'),
      })
      .parse(req.body)
    const device = await prisma.deviceToken.upsert({
      where: { token: body.token },
      create: { token: body.token, platform: body.platform, userId: req.user!.id },
      update: { platform: body.platform, userId: req.user!.id },
    })
    res.json(device)
  }),
)

export default router
