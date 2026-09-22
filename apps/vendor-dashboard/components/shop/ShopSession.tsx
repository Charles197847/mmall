'use client'

import Link from 'next/link'
import { useAuthHydrated } from '../../hooks/useAuthHydrated'
import { useAuthStore } from '../../stores/authStore'

export function ShopSession() {
  const hydrated = useAuthHydrated()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)

  if (!hydrated) {
    return <div className="h-10 w-16 shrink-0" aria-hidden />
  }

  if (token && user) {
    const desk = user.role === 'VENDOR' || user.role === 'ADMIN'
    const label = user.firstName || user.email
    return (
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {desk ? (
          <Link href="/products" className="text-sm font-semibold text-glow">
            Your store
          </Link>
        ) : (
          <span className="max-w-[7rem] truncate text-sm text-ice">{label}</span>
        )}
        <button type="button" onClick={logout} className="text-sm text-signal">
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-3 sm:gap-4">
      <Link href="/shop/join" className="hidden text-sm text-ice hover:text-glow sm:inline">
        Join
      </Link>
      <Link
        href="/shop/login?next=/shop"
        className="rounded-full bg-brand px-3 py-2 text-sm text-white hover:opacity-90 sm:px-5 sm:py-2.5"
      >
        Sign in
      </Link>
    </div>
  )
}
