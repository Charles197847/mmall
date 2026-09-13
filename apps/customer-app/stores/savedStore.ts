import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Product } from '@shopping-mall/shared-types'

export type SavedItem = {
  id: string
  name: string
  price: number
  image?: string
  vendorName?: string
}

interface SavedStore {
  items: SavedItem[]
  toggle: (item: SavedItem) => void
  isSaved: (id: string) => boolean
}

export function toSavedItem(product: Pick<Product, 'id' | 'name' | 'price' | 'images' | 'vendor'>): SavedItem {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0],
    vendorName: product.vendor?.storeName,
  }
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((row) => row.id === item.id)
        set({
          items: exists ? get().items.filter((row) => row.id !== item.id) : [item, ...get().items],
        })
      },
      isSaved: (id) => get().items.some((row) => row.id === id),
    }),
    {
      name: 'mmall-saved',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
