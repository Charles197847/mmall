import { Platform } from 'react-native'

const KEY = 'mmall-pending-checkout'

export type PendingCheckout = {
  orderId: string
  payRequestId?: string | null
  giftCode?: string
  giftSpend?: number
}

let nativePending: PendingCheckout | null = null

function webStorage() {
  return Platform.OS === 'web' && typeof sessionStorage !== 'undefined' ? sessionStorage : null
}

export function rememberPendingCheckout(value: PendingCheckout) {
  nativePending = value
  webStorage()?.setItem(KEY, JSON.stringify(value))
}

export function readPendingCheckout(): PendingCheckout | null {
  const storage = webStorage()
  if (storage) {
    try {
      const raw = storage.getItem(KEY)
      return raw ? (JSON.parse(raw) as PendingCheckout) : nativePending
    } catch {
      return nativePending
    }
  }
  return nativePending
}

export function clearPendingCheckout() {
  nativePending = null
  webStorage()?.removeItem(KEY)
}

export function isDemoSku(productId: string) {
  return productId.startsWith('mock-')
}
