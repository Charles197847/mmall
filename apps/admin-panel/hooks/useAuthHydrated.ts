'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

/**
 * True after mount and after authStore persist rehydration.
 * Mount gate keeps the server HTML from flashing a signed-in shell, and blocks replace('/login') until the stored token is loaded.
 */
export function useAuthHydrated() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted && hasHydrated
}
