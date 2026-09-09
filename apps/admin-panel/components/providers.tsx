'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type PropsWithChildren } from 'react'
import { AdminGuard } from './auth/AdminGuard'
import { ThemeSync } from './theme/ThemeSync'

export function Providers({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <ThemeSync />
      <AdminGuard>{children}</AdminGuard>
    </QueryClientProvider>
  )
}
