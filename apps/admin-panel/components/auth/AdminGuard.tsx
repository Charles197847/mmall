'use client'

import { useEffect, type PropsWithChildren } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '../../stores/authStore'

export function AdminGuard({ children }: PropsWithChildren) {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const isLogin = pathname === '/login'
  const authorized = Boolean(token && user?.role === 'ADMIN')

  useEffect(() => {
    if (isLogin) return
    if (!authorized) router.replace('/login')
  }, [authorized, isLogin, router])

  if (isLogin) return children

  if (!authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-void">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glow mx-auto" />
          <p className="mt-4 text-mute">Verifying access...</p>
        </div>
      </div>
    )
  }

  return children
}
