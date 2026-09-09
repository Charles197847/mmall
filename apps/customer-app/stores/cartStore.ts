import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { CartItem } from '@shopping-mall/shared-types'

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemsByVendor: () => Map<string, CartItem[]>
  getItemCount: () => number
  isInCart: (productId: string) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.productId === item.productId)
        if (existing) {
          const newQuantity = Math.min(existing.quantity + (item.quantity ?? 1), existing.maxQuantity)
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: newQuantity } : i,
            ),
          })
        } else {
          set({
            items: [
              ...get().items,
              {
                ...item,
                quantity: item.quantity ?? 1,
                maxQuantity: item.maxQuantity || 999,
              },
            ],
          })
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        const item = get().items.find((i) => i.productId === productId)
        if (item && quantity <= item.maxQuantity) {
          set({
            items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
          })
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemsByVendor: () => {
        const map = new Map<string, CartItem[]>()
        get().items.forEach((item) => {
          if (!map.has(item.vendorId)) map.set(item.vendorId, [])
          map.get(item.vendorId)!.push(item)
        })
        return map
      },
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      isInCart: (productId) => get().items.some((i) => i.productId === productId),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
