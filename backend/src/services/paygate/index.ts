import { randomInt, randomUUID } from 'node:crypto'
import { prisma } from '../../shared/database/index.js'
import { queue } from '../../shared/queue/index.js'
import { HttpError } from '../../shared/middleware/error.js'
import { PAYGATE_ENCRYPTION_KEY, PAYGATE_TEST_ID, paygateChecksum, verifyChecksum } from './checksum.js'

const apiPublic = () => process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 4000}`
const shopperReturn = () => `${process.env.FRONTEND_URL ?? 'http://localhost:8081'}/cart/payment-return`

type PayMethod = 'CC' | 'EW' | 'BT'

export function initiateChecksum(input: {
  reference: string
  amountCents: number
  returnUrl: string
  transactionDate: string
  email: string
  notifyUrl: string
}) {
  return paygateChecksum([
    PAYGATE_TEST_ID,
    input.reference,
    input.amountCents,
    'ZAR',
    input.returnUrl,
    input.transactionDate,
    'en-za',
    'ZAF',
    input.email,
    input.notifyUrl,
  ])
}

export async function initiatePaygate(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  })
  if (!order) throw new HttpError(404, 'Order not found')
  if (order.paymentStatus === 'PAID') {
    throw new HttpError(400, 'Order is already paid')
  }

  const payRequestId = order.payRequestId ?? randomUUID().toUpperCase()
  const amountCents = Math.round(order.totalAmount * 100)
  const transactionDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const returnUrl = shopperReturn()
  const notifyUrl = `${apiPublic()}/api/v1/payments/paygate/notify`
  const checksum = initiateChecksum({
    reference: order.id,
    amountCents,
    returnUrl,
    transactionDate,
    email: order.customer.email,
    notifyUrl,
  })

  await prisma.order.update({
    where: { id: order.id },
    data: {
      payRequestId,
      paymentIntentId: payRequestId,
    },
  })

  return {
    PAYGATE_ID: PAYGATE_TEST_ID,
    PAY_REQUEST_ID: payRequestId,
    REFERENCE: order.id,
    CHECKSUM: checksum,
    AMOUNT: amountCents,
    CURRENCY: 'ZAR',
    checkoutUrl: `${apiPublic()}/paygate/mock/${payRequestId}`,
  }
}

export function mockCheckoutPage(payRequestId: string, amount: number, reference: string) {
  const rand = amount.toFixed(2)
  return `<!doctype html>
<html lang="en-ZA">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PayGate PayWeb · MMall</title>
</head>
<body style="margin:0;font-family:Segoe UI,Arial,sans-serif;background:#0b1b3a;color:#e8eefc;">
  <main style="max-width:420px;margin:40px auto;background:#122044;border-radius:20px;padding:28px;box-shadow:0 10px 40px rgba(0,0,0,.35);">
    <p style="letter-spacing:.2em;font-size:11px;color:#8ba0c9;">PAYGATE PAYWEB 3 · MOCK</p>
    <h1 style="margin:8px 0 4px;font-size:28px;">MMall checkout</h1>
    <p style="color:#8ba0c9;margin:0 0 20px;">Reference ${reference.slice(0, 10)} · ZAR ${rand}</p>
    <p style="font-size:13px;color:#c5d2ea;">This is a local PayGate stand-in. No live card is charged. Cards, Instant EFT, and Ozow will hit this same return/notify contract in production.</p>
    <form method="post" action="/paygate/mock/${payRequestId}/complete" style="display:grid;gap:10px;margin-top:22px;">
      <button name="result" value="approved" style="background:#2f6bff;color:#fff;border:0;border-radius:12px;padding:12px;font-weight:700;">Pay with Visa · R${rand}</button>
      <button name="result" value="eft" style="background:#0f766e;color:#fff;border:0;border-radius:12px;padding:12px;font-weight:700;">Pay with Instant EFT</button>
      <button name="result" value="declined" style="background:#1b2d55;color:#e8eefc;border:1px solid #3d4f73;border-radius:12px;padding:12px;">Decline payment</button>
      <button name="result" value="cancelled" style="background:transparent;color:#8ba0c9;border:0;padding:8px;">Cancel and return</button>
    </form>
  </main>
</body>
</html>`
}

export async function completeMockPayment(payRequestId: string, result: string) {
  const order = await prisma.order.findUnique({ where: { payRequestId } })
  if (!order) throw new HttpError(404, 'PayGate request not found')

  const approved = result === 'approved' || result === 'eft'
  const status = approved ? 1 : result === 'cancelled' ? 4 : 2
  const payMethod: PayMethod = result === 'eft' ? 'EW' : 'CC'
  const transactionId = String(randomInt(10_000_000, 99_999_999))
  const authCode = approved ? '5T8A0Z' : ''
  const resultCode = approved ? '990017' : result === 'cancelled' ? '990020' : '900003'
  const resultDesc = approved ? 'Auth Done' : result === 'cancelled' ? 'User Cancelled' : 'Declined'
  const amountCents = Math.round(order.totalAmount * 100)
  const payload = {
    PAYGATE_ID: PAYGATE_TEST_ID,
    PAY_REQUEST_ID: payRequestId,
    REFERENCE: order.id,
    TRANSACTION_STATUS: String(status),
    RESULT_CODE: resultCode,
    AUTH_CODE: authCode,
    CURRENCY: 'ZAR',
    AMOUNT: String(amountCents),
    RESULT_DESC: resultDesc,
    TRANSACTION_ID: transactionId,
    RISK_INDICATOR: 'AX',
    PAY_METHOD: payMethod,
    PAY_METHOD_DETAIL: payMethod === 'EW' ? 'InstantEFT' : 'Visa',
  }
  const checksum = paygateChecksum([
    payload.PAYGATE_ID,
    payload.PAY_REQUEST_ID,
    payload.REFERENCE,
    payload.TRANSACTION_STATUS,
    payload.RESULT_CODE,
    payload.AUTH_CODE,
    payload.CURRENCY,
    payload.AMOUNT,
    payload.RESULT_DESC,
    payload.TRANSACTION_ID,
    payload.RISK_INDICATOR,
    payload.PAY_METHOD,
    payload.PAY_METHOD_DETAIL,
  ])

  await applyPaygateNotify({ ...payload, CHECKSUM: checksum })

  const returnQs = new URLSearchParams({
    PAY_REQUEST_ID: payRequestId,
    TRANSACTION_STATUS: String(status),
    CHECKSUM: paygateChecksum([PAYGATE_TEST_ID, payRequestId, order.id], PAYGATE_ENCRYPTION_KEY),
  })
  return `${shopperReturn()}?${returnQs.toString()}`
}

export async function applyPaygateNotify(body: Record<string, string>) {
  const fields = [
    body.PAYGATE_ID,
    body.PAY_REQUEST_ID,
    body.REFERENCE,
    body.TRANSACTION_STATUS,
    body.RESULT_CODE,
    body.AUTH_CODE,
    body.CURRENCY,
    body.AMOUNT,
    body.RESULT_DESC,
    body.TRANSACTION_ID,
    body.RISK_INDICATOR,
    body.PAY_METHOD,
    body.PAY_METHOD_DETAIL,
  ]
  if (!verifyChecksum(fields, body.CHECKSUM ?? '')) {
    throw new HttpError(400, 'Invalid PayGate checksum')
  }

  const order = await prisma.order.findFirst({
    where: { OR: [{ payRequestId: body.PAY_REQUEST_ID }, { id: body.REFERENCE }] },
  })
  if (!order) throw new HttpError(404, 'Order not found for PayGate notify')
  if (order.paymentStatus === 'PAID') return order

  const approved = body.TRANSACTION_STATUS === '1'
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: approved ? 'PAID' : 'FAILED',
      status: approved ? 'PROCESSING' : 'PENDING',
      paygateTransactionId: body.TRANSACTION_ID,
      paymentMethod: body.PAY_METHOD_DETAIL || body.PAY_METHOD,
    },
  })
  if (approved) {
    await prisma.vendorOrder.updateMany({
      where: { orderId: order.id },
      data: { status: 'PROCESSING' },
    })
    await queue.add('notification:payment-confirmed', { orderId: order.id })
    await queue.add('order:fulfillment', { orderId: order.id })
  }
  return order
}

export async function registerPaygateBeneficiary(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: { kyc: true },
  })
  if (!vendor) throw new HttpError(404, 'Vendor not found')
  const beneficiaryId = vendor.paygateBeneficiaryId ?? `PGBEN-${vendorId.slice(-8).toUpperCase()}`
  const updated = await prisma.vendor.update({
    where: { id: vendorId },
    data: { paygateBeneficiaryId: beneficiaryId },
  })
  return {
    beneficiaryId,
    provider: 'paygate-paybatch',
    bankProof: vendor.kyc?.bankProofName ?? null,
    message: 'Mock PayBatch beneficiary registered. Weekly EFT payouts will use this account once PayGate goes live.',
    vendor: updated,
  }
}
