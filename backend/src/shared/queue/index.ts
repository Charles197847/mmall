import { Queue, Worker, type Job } from 'bullmq'
import { redis } from '../redis/index.js'

const connection = redis

export const queue = new Queue('shopping-mall', { connection })

type JobHandler = (job: Job) => Promise<unknown>

const handlers = new Map<string, JobHandler>()

export function registerJob(name: string, handler: JobHandler) {
  handlers.set(name, handler)
}

export async function enqueueJob(name: string, data: unknown, opts?: { delay?: number }) {
  try {
    await queue.add(name, data, opts)
    return
  } catch (error) {
    console.warn(`Queue unavailable for ${name}`, error)
  }

  if ((opts?.delay ?? 0) > 0) {
    console.warn(`Delayed job ${name} skipped without Redis`)
    return
  }

  const handler = handlers.get(name)
  if (handler) {
    await handler({ name, data } as Job)
  }
}

export function startWorkers() {
  const worker = new Worker(
    'shopping-mall',
    async (job) => {
      const handler = handlers.get(job.name)
      if (!handler) {
        console.warn(`No handler registered for job ${job.name}`)
        return
      }
      return handler(job)
    },
    { connection },
  )

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.name} failed`, err)
  })

  return worker
}
