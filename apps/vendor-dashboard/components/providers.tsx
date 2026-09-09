'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'
import { AuthGuard } from './auth/AuthGuard'
import { ThemeSync } from './theme/ThemeSync'

export function Providers({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <ThemeSync />
      <AuthGuard requiredRole="VENDOR">{children}</AuthGuard>
    </QueryClientProvider>
  )
}
