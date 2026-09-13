import { metroCode, quoteCourierGuy } from '@shopping-mall/shared-types'

export type CourierServiceCode = 'ECO' | 'OVN' | 'SDD'

export type AddressInput = {
  fullName?: string
  line1?: string
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export type ShippingQuote = {
  carrier: 'THE_COURIER_GUY'
  serviceLevelCode: CourierServiceCode
  serviceName: string
  amount: number
  currency: 'ZAR'
  estimatedDays: number
  available: boolean
  note: string
}

export function metro(city: string) {
  return metroCode(city)
}

export { quoteCourierGuy }
