import { createApiClient } from '@shopping-mall/api-client'
import { useAuthStore } from '../stores/authStore'

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'production'
    ? 'https://mmall-api.meeronixgroup.co.za/api/v1'
    : 'http://localhost:4000/api/v1')

export const api = createApiClient({
  baseUrl,
  getToken: () => (typeof window === 'undefined' ? null : useAuthStore.getState().token),
})
