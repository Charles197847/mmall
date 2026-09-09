import { registerJob } from './shared/queue/index.js'
import { createVendorStripeAccount, processPayment } from './services/payments/index.js'

registerJob('vendor:create-stripe-account', async (job) => {
  await createVendorStripeAccount(job.data.vendorId)
})

registerJob('payment:process', async (job) => {
  await processPayment(job.data.orderId)
})

registerJob('order:fulfillment', async (job) => {
  console.log('Fulfillment started', job.data)
})
