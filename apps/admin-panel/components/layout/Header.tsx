'use client'

import { useAuthStore } from '../../stores/authStore'
import { ThemeToggle } from '../theme/ThemeToggle'

export function Header() {
  const { user, logout } = useAuthStore()
  return (
    <header className="relative h-14 px-6 flex items-center justify-between bg-navy/70 backdrop-blur-xl">
      <span className="text-sm text-mute tracking-wide">MMall platform administration</span>
      <div className="flex gap-3 items-center">
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
