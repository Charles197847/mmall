export type GuestLoveItem = {
  productId: string
  name: string
  price: number
  image?: string
}

const KEY = 'mmall-guest-love'

export function readGuestLove(): GuestLoveItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GuestLoveItem[]) : []
  } catch {
    return []
  }
}

export function writeGuestLove(items: GuestLoveItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('mmall-love'))
}

export function isLoved(productId: string) {
  return readGuestLove().some((item) => item.productId === productId)
}

export function toggleGuestLove(item: GuestLoveItem) {
  const items = readGuestLove()
  const next = items.some((row) => row.productId === item.productId)
    ? items.filter((row) => row.productId !== item.productId)
    : [...items, item]
  writeGuestLove(next)
  return next
}

export function loveCount(items = readGuestLove()) {
  return items.length
}
