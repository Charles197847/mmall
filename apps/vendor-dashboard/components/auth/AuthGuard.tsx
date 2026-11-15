'use client'

import { useEffect, type PropsWithChildren } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { useAuthHydrated } from '../../hooks/useAuthHydrated'
import { isPublicPath } from '../../lib/publicPaths'

function isVendorDesk(token: string | null, user: { role: string } | null) {
  return Boolean(token && user && (user.role === 'VENDOR' || user.role === 'ADMIN'))
}

export function AuthGuard({
  children,
  requiredRole,
}: PropsWithChildren<{ requiredRole?: 'VENDOR' | 'ADMIN' }>) {
  const { user, token } = useAuthStore()
  const hydrated = useAuthHydrated()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!hydrated || isPublicPath(pathname)) return
    if (pathname === '/' && !isVendorDesk(token, user)) {
      router.replace('/shop')
      return
    }
    if (!token || !user) {
      router.replace('/login')
      return
    }
    if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
      router.replace(user.role === 'CUSTOMER' ? '/shop' : '/login')
    }
  }, [hydrated, token, user, requiredRole, router, pathname])

  if (isPublicPath(pathname)) return children
  if (!hydrated) return <div className="p-8 text-mute">Checking session...</div>
  if (pathname === '/' && !isVendorDesk(token, user)) {
    return <div className="p-8 text-mute">Opening the shop...</div>
  }
  if (!token || !user) return <div className="p-8 text-mute">Checking session...</div>
  return children
}
