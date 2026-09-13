export type GuestBagItem = {
  productId: string
  name: string
  price: number
  image?: string
  quantity: number
  options: Record<string, string>
}

const KEY = 'mmall-guest-bag'

export function readGuestBag(): GuestBagItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GuestBagItem[]) : []
  } catch {
    return []
  }
}

export function writeGuestBag(items: GuestBagItem[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('mmall-bag'))
}

export function addGuestBagItem(item: Omit<GuestBagItem, 'quantity'> & { quantity?: number }) {
  const items = readGuestBag()
  const signature = JSON.stringify(item.options)
  const existing = items.find((row) => row.productId === item.productId && JSON.stringify(row.options) === signature)
  if (existing) {
    existing.quantity += item.quantity ?? 1
  } else {
    items.push({ ...item, quantity: item.quantity ?? 1 })
  }
  writeGuestBag(items)
  return items
}

export function bagCount(items = readGuestBag()) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}
