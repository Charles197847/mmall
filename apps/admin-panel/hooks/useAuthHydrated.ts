'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

/** True only after zustand persist has rehydrated. First paint stays logged-out-shaped. */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const finish = () => setHydrated(true)
    const unsubscribe = useAuthStore.persist.onFinishHydration(finish)
    if (useAuthStore.persist.hasHydrated()) finish()
    return unsubscribe
  }, [])

  return hydrated
}
