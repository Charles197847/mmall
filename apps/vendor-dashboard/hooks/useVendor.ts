import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'

export function useVendor() {
  const token = useAuthStore((s) => s.token)
  const query = useQuery({
    queryKey: ['vendor-me'],
    queryFn: () => api.auth.me(),
    enabled: Boolean(token),
  })

  return {
    vendor: query.data?.vendor ?? null,
    kyc: query.data?.kyc ?? null,
    refetch: query.refetch,
    isLoading: query.isLoading,
  }
}
