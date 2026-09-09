'use client'

import { useAuthStore } from '../../stores/authStore'
import { ThemeToggle } from '../theme/ThemeToggle'

export function Header() {
  const { user, logout } = useAuthStore()
  return (
    <header className="relative h-14 flex items-center justify-between px-6 bg-navy/70 backdrop-blur-xl">
      <p className="text-sm text-mute tracking-wide">Store, catalog, and payouts</p>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="text-sm text-ice">{user?.email}</span>
        <button type="button" onClick={logout} className="text-sm text-signal">
          Sign out
        </button>
      </div>
      <span className="mm-rule pointer-events-none absolute inset-x-8 bottom-0" />
    </header>
  )
}
