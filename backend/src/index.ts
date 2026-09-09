import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './services/auth/index.js'
import vendorRoutes from './services/vendors/index.js'
import productRoutes from './services/products/index.js'
import orderRoutes from './services/orders/index.js'
import notificationRoutes from './services/notifications/index.js'
import studioRoutes from './services/studio/index.js'
import adRoutes from './services/ads/index.js'
import searchRoutes from './services/search/index.js'
import paymentRoutes from './routes/payments.js'
import adminRoutes from './routes/admin.js'
import { optionalAuth } from './shared/middleware/auth.js'
import { setTenantContext } from './shared/middleware/tenant.js'
import { errorHandler } from './shared/middleware/error.js'
import { connectRedis } from './shared/redis/index.js'
import { startWorkers } from './shared/queue/index.js'
import './jobs.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)

app.use(helmet())
app.use(cors())
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'shopping-mall-api' })
})

app.use(optionalAuth)
app.use(setTenantContext)

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/vendors', vendorRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/payments', paymentRoutes)
app.use('/api/v1/notifications', notificationRoutes)
app.use('/api/v1/studio', studioRoutes)
app.use('/api/v1/ads', adRoutes)
app.use('/api/v1/search', searchRoutes)
app.use('/api/v1/admin', adminRoutes)

app.use(errorHandler)

async function start() {
  try {
    await connectRedis()
    startWorkers()
  } catch (error) {
    console.warn('Redis/queue unavailable — API will start without background jobs', error)
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

start()
