import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.flatten(),
    })
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message, ...err.extra })
  }

  const message = err instanceof Error ? err.message : 'Internal server error'
  const status = message === 'Unauthorized' ? 401 : 500

  if (status === 500) {
    console.error(err)
  }

  res.status(status).json({ error: message })
}

export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
