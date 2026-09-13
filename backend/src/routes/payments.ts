import { Router } from 'express'
import { z } from 'zod'
import { requireAuth, requireVendor } from '../shared/middleware/auth.js'
import { asyncHandler } from '../shared/middleware/error.js'
import { assertKyc } from '../shared/kyc.js'
import {
  applyPaygateNotify,
  completeMockPayment,
  initiatePaygate,
  mockCheckoutPage,
  registerPaygateBeneficiary,
} from '../services/paygate/index.js'
import { prisma } from '../shared/database/index.js'
import { HttpError } from '../shared/middleware/error.js'

const router = Router()

router.post(
  '/paygate/initiate',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { orderId } = z.object({ orderId: z.string().min(8) }).parse(req.body)
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: req.user!.id },
    })
    if (!order) throw new HttpError(404, 'Order not found')
    res.json(await initiatePaygate(order.id))
  }),
)

router.post(
  '/paygate/notify',
  asyncHandler(async (req, res) => {
    const body = Object.fromEntries(
      Object.entries(req.body ?? {}).map(([key, value]) => [key, String(value)]),
    )
    await applyPaygateNotify(body)
    res.type('text/plain').send('OK')
  }),
)

router.post(
  '/payouts/register',
  requireAuth,
  requireVendor,
  asyncHandler(async (req, res) => {
    await assertKyc(req.tenantId!, 'ENTERPRISE')
    res.json(await registerPaygateBeneficiary(req.tenantId!))
  }),
)

export default router

export const paygateMockRouter = Router()

paygateMockRouter.get(
  '/:payRequestId',
  asyncHandler(async (req, res) => {
    const payRequestId = String(req.params.payRequestId)
    const order = await prisma.order.findUnique({ where: { payRequestId } })
    if (!order) throw new HttpError(404, 'PayGate session expired')
    res.removeHeader('Content-Security-Policy')
    res.type('html').send(mockCheckoutPage(payRequestId, order.totalAmount, order.id))
  }),
)

paygateMockRouter.post(
  '/:payRequestId/complete',
  asyncHandler(async (req, res) => {
    const result = String(req.body?.result ?? 'approved')
    const redirect = await completeMockPayment(String(req.params.payRequestId), result)
    res.redirect(redirect)
  }),
)
