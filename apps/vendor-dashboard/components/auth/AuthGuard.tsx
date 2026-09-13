'use client'

import { useEffect, type PropsWithChildren } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'
import { isPublicPath } from '../../lib/publicPaths'

export function AuthGuard({
  children,
  requiredRole,
}: PropsWithChildren<{ requiredRole?: 'VENDOR' | 'ADMIN' }>) {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isPublicPath(pathname)) return
    if (!token || !user) {
      router.replace('/login')
      return
    }
    if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
      router.replace(user.role === 'CUSTOMER' ? '/shop' : '/login')
    }
  }, [token, user, requiredRole, router, pathname])

  if (isPublicPath(pathname)) return children
  if (!token || !user) return <div className="p-8 text-mute">Checking session...</div>
  return children
}
