'use client'

import { useAuthStore } from '../../stores/authStore'
import { ThemeToggle } from '../theme/ThemeToggle'

export function Header({ menuOpen, onMenu }: { menuOpen: boolean; onMenu: () => void }) {
  const { user, logout } = useAuthStore()
  return (
    <header className="relative flex h-14 items-center justify-between gap-3 bg-navy/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ice hover:bg-panel lg:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="desk-nav"
          onClick={onMenu}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
        <p className="truncate text-sm tracking-wide text-mute">Store, catalog, and payouts</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <ThemeToggle />
        <span className="hidden max-w-[12rem] truncate text-sm text-ice sm:inline">{user?.email}</span>
        <button type="button" onClick={logout} className="text-sm text-signal">
          Sign out
        </button>
      </div>
      <span className="mm-rule pointer-events-none absolute inset-x-8 bottom-0" />
    </header>
  )
}
