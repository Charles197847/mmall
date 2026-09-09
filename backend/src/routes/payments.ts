import { Router } from 'express'
import { requireAuth, requireVendor } from '../shared/middleware/auth.js'
import { asyncHandler } from '../shared/middleware/error.js'
import {
  createVendorStripeAccount,
  handleWebhook,
  processPayment,
  stripe,
} from '../services/payments/index.js'

const router = Router()

router.post(
  '/create-intent',
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await processPayment(req.body.orderId)
    res.json(result)
  }),
)

router.post(
  '/create-account-link',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    const result = await createVendorStripeAccount(req.tenantId!)
    res.json(result)
  }),
)

router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret || !process.env.STRIPE_SECRET_KEY) {
      await handleWebhook(req.body)
      return res.json({ received: true, mode: 'dev' })
    }

    const sig = req.headers['stripe-signature']
    if (typeof sig !== 'string') {
      return res.status(400).json({ error: 'Missing stripe-signature' })
    }

    const event = stripe.webhooks.constructEvent(req.body, sig, secret)
    await handleWebhook(event)
    res.json({ received: true })
  }),
)

export default router
