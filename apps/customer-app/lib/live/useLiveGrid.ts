import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { API_BASE } from '../api'
import { useAuth } from '../auth/AuthProvider'

export function useLiveGrid() {
  const queryClient = useQueryClient()
  const token = useAuth().token

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof EventSource === 'undefined') return
    const url = `${API_BASE}/events${token ? `?token=${encodeURIComponent(token)}` : ''}`
    const source = new EventSource(url)

    const refreshAds = () => {
      void queryClient.invalidateQueries({ queryKey: ['ad-slot'] })
    }
    const refreshCatalog = () => {
      void queryClient.invalidateQueries({ queryKey: ['featured-products'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['vendor'] })
    }
    const refreshOrders = () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }

    source.addEventListener('ads', refreshAds)
    source.addEventListener('inventory', refreshCatalog)
    source.addEventListener('order', refreshOrders)
    source.onerror = () => {
      // EventSource reconnects on its own
    }

    return () => {
      source.close()
    }
  }, [queryClient, token])
}
