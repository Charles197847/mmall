import { Redis } from 'ioredis'

const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379'

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  lazyConnect: true,
})

export async function connectRedis() {
  if (redis.status === 'wait') {
    await redis.connect()
  }
}
