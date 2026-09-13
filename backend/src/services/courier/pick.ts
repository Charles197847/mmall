import { HttpError } from '../../shared/middleware/error.js'
import type { ShippingQuote } from './quotes.js'

export function pickQuote(quotes: ShippingQuote[], serviceLevelCode: string) {
  const quote = quotes.find((item) => item.serviceLevelCode === serviceLevelCode && item.available)
  if (!quote) throw new HttpError(400, 'Selected Courier Guy service is not available for this address')
  return quote
}
