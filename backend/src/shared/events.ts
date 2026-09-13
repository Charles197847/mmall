import type { Response } from 'express'

export type GridEvent = {
  type: 'inventory' | 'ads' | 'order' | 'heartbeat'
  payload?: Record<string, unknown>
}

const clients = new Set<Response>()

export function subscribeGrid(res: Response) {
  clients.add(res)
  res.on('close', () => {
    clients.delete(res)
  })
}

export function publishGrid(event: GridEvent) {
  const frame = `event: ${event.type}\ndata: ${JSON.stringify(event.payload ?? {})}\n\n`
  for (const client of clients) {
    client.write(frame)
  }
}
