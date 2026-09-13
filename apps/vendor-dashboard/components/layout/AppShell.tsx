'use client'

import { usePathname } from 'next/navigation'
import type { CSSProperties, PropsWithChildren } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useVendor } from '../../hooks/useVendor'
import { isPublicPath } from '../../lib/publicPaths'

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname()
  const { vendor } = useVendor()
  const theme = vendor?.settings?.theme

  if (isPublicPath(pathname)) {
    return <>{children}</>
  }

  const style = {
    '--store-primary': theme?.primaryColor ?? '#2F6BFF',
    '--store-secondary': theme?.secondaryColor ?? '#3DE8FF',
    fontFamily: theme?.fontFamily ? `${theme.fontFamily}, sans-serif` : undefined,
  } as CSSProperties

  return (
    <div className="flex h-screen bg-grid" style={style}>
      <Sidebar storeName={vendor?.storeName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
