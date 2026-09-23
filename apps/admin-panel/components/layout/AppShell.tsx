'use client'

import { useEffect, useState, type PropsWithChildren } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  if (pathname === '/login') return children

  return (
    <div className="flex h-screen min-w-0 bg-grid">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} />
        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
