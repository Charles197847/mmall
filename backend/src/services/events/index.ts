import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { subscribeGrid, publishGrid } from '../../shared/events.js'
import { getJwtSecret } from '../../shared/jwt-secret.js'
import { asyncHandler } from '../../shared/middleware/error.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const token = typeof req.query.token === 'string' ? req.query.token : undefined
    if (token) {
      try {
        jwt.verify(token, getJwtSecret())
      } catch {
        return res.status(401).json({ error: 'Invalid token' })
      }
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()
    subscribeGrid(res)
    res.write(`event: heartbeat\ndata: {"ok":true}\n\n`)

    const pulse = setInterval(() => {
      res.write(`event: heartbeat\ndata: {"t":${Date.now()}}\n\n`)
    }, 25000)
    req.on('close', () => clearInterval(pulse))
  }),
)

router.post(
  '/ads-refresh',
  asyncHandler(async (_req, res) => {
    publishGrid({ type: 'ads', payload: { reason: 'manual' } })
    res.json({ ok: true })
  }),
)

export default router
