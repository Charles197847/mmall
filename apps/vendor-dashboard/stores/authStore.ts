import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@shopping-mall/shared-types'

type AuthState = {
  token: string | null
  user: User | null
  hasHydrated: boolean
  setSession: (token: string, user: User) => void
  logout: () => void
  setHasHydrated: (hasHydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'vendor-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
