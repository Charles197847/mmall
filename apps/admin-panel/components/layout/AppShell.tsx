'use client'

import { usePathname } from 'next/navigation'
import type { PropsWithChildren } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  if (pathname === '/login') return children

  return (
    <div className="flex h-screen bg-grid">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
