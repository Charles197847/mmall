const KEY = 'mmall-pending-checkout'

export type PendingCheckout = {
  orderId: string
  payRequestId?: string | null
  giftCode?: string
  giftSpend?: number
}

export function rememberPendingCheckout(value: PendingCheckout) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(KEY, JSON.stringify(value))
}

export function readPendingCheckout(): PendingCheckout | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as PendingCheckout) : null
  } catch {
    return null
  }
}

export function clearPendingCheckout() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(KEY)
}

export function isDemoSku(productId: string) {
  return productId.startsWith('mock-')
}
