import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { CartItem } from '@shopping-mall/shared-types'

export type BagItem = CartItem & {
  options?: Record<string, string>
  lineKey: string
}

function lineKey(productId: string, options?: Record<string, string>) {
  const pairs = Object.entries(options ?? {}).sort(([a], [b]) => a.localeCompare(b))
  return pairs.length ? `${productId}::${pairs.map(([key, value]) => `${key}=${value}`).join('|')}` : productId
}

function withKey(item: CartItem & { options?: Record<string, string>; lineKey?: string }): BagItem {
  return { ...item, lineKey: item.lineKey ?? lineKey(item.productId, item.options) }
}

interface CartStore {
  items: BagItem[]
  addItem: (item: Omit<BagItem, 'quantity' | 'lineKey'> & { quantity?: number }) => void
  removeItem: (lineKey: string) => void
  updateQuantity: (lineKey: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemsByVendor: () => Map<string, BagItem[]>
  getItemCount: () => number
  isInCart: (productId: string, options?: Record<string, string>) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const key = lineKey(item.productId, item.options)
        const existing = get().items.find((row) => row.lineKey === key)
        if (existing) {
          const quantity = Math.min(existing.quantity + (item.quantity ?? 1), existing.maxQuantity)
          set({
            items: get().items.map((row) => (row.lineKey === key ? { ...row, quantity } : row)),
          })
          return
        }
        set({
          items: [
            ...get().items,
            withKey({
              ...item,
              quantity: item.quantity ?? 1,
              maxQuantity: item.maxQuantity || 999,
            }),
          ],
        })
      },
      removeItem: (key) => {
        set({ items: get().items.filter((item) => item.lineKey !== key) })
      },
      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key)
          return
        }
        set({
          items: get().items.map((item) =>
            item.lineKey === key ? { ...item, quantity: Math.min(quantity, item.maxQuantity) } : item,
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemsByVendor: () => {
        const map = new Map<string, BagItem[]>()
        get().items.forEach((item) => {
          if (!map.has(item.vendorId)) map.set(item.vendorId, [])
          map.get(item.vendorId)!.push(item)
        })
        return map
      },
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      isInCart: (productId, options) => get().items.some((item) => item.lineKey === lineKey(productId, options)),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const stored = (persisted as { items?: BagItem[] } | undefined)?.items ?? []
        return { ...current, items: stored.map((item) => withKey(item)) }
      },
    },
  ),
)
