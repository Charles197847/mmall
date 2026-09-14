import { create } from 'zustand'
import {
  defaultShopFilter,
  mergeShopFilter,
  type ShopFilter,
} from '../lib/shopFilters'

interface FilterStore {
  filter: ShopFilter
  setFilter: (patch: Partial<ShopFilter>) => void
  clear: () => void
}

export const useFilterStore = create<FilterStore>((set, get) => ({
  filter: defaultShopFilter,
  setFilter: (patch) => set({ filter: mergeShopFilter(get().filter, patch) }),
  clear: () => set({ filter: defaultShopFilter }),
}))
