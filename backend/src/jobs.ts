import { registerJob } from './shared/queue/index.js'
import { initiatePaygate } from './services/paygate/index.js'

registerJob('payment:process', async (job) => {
  await initiatePaygate(job.data.orderId)
})

registerJob('order:fulfillment', async (job) => {
  console.log('Fulfillment started', job.data)
})
