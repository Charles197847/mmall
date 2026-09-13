import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { SaPlace, ShopperArea } from '@shopping-mall/shared-types'

interface AreaStore {
  place: ShopperArea | null
  setPlace: (place: SaPlace | ShopperArea | null) => void
}

export const useAreaStore = create<AreaStore>()(
  persist(
    (set) => ({
      place: null,
      setPlace: (place) =>
        set({
          place: place ? { ...place, source: 'source' in place ? place.source : 'search' } : null,
        }),
    }),
    {
      name: 'mmall-deliver-to',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ place: state.place }),
    },
  ),
)
