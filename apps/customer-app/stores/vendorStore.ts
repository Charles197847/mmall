import { create } from 'zustand'
import type { Vendor } from '@shopping-mall/shared-types'

type VendorState = {
  featured: Vendor[]
  setFeatured: (vendors: Vendor[]) => void
}

export const useVendorStore = create<VendorState>((set) => ({
  featured: [],
  setFeatured: (featured) => set({ featured }),
}))
