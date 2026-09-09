import { Platform } from 'react-native'
import type { AdPlacement, AppNotification, Order, Paginated, Product, User, Vendor } from '@shopping-mall/shared-types'

function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }
  if (Platform.OS === 'web' || Platform.OS === 'ios') {
    return 'http://localhost:4000/api/v1'
  }
  return 'http://10.0.2.2:4000/api/v1'
}

const API_BASE = getBaseUrl()

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? `Request failed: ${response.status}`)
  }
  return data as T
}

export type RegisterPayload = {
  email: string
  password: string
  firstName: string
  lastName: string
}

export type AuthResponse = {
  token: string
  user: User
  error?: string
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      return res.json() as Promise<AuthResponse>
    },
    register: async (data: RegisterPayload) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json() as Promise<AuthResponse>
    },
    me: (token: string) =>
      request<User & { vendor?: Vendor | null }>('/auth/me', {
        headers: getHeaders(token),
      }),
  },

  products: {
    list: async (params?: {
      q?: string
      category?: string
      vendorId?: string
      excludeVendorId?: string
      page?: number
      limit?: number
    }) => {
      const query = new URLSearchParams()
      if (params?.q) query.append('q', params.q)
      if (params?.category) query.append('category', params.category)
      if (params?.vendorId) query.append('vendorId', params.vendorId)
      if (params?.excludeVendorId) query.append('excludeVendorId', params.excludeVendorId)
      if (params?.page) query.append('page', String(params.page))
      if (params?.limit) query.append('limit', String(params.limit))
      const qs = query.toString()
      return request<Paginated<Product>>(`/products${qs ? `?${qs}` : ''}`)
    },
    get: (id: string) => request<Product>(`/products/${id}`),
  },

  vendors: {
    get: (slug: string) => request<Vendor>(`/vendors/${slug}`),
    list: () => request<Vendor[]>('/vendors'),
  },

  orders: {
    create: (data: unknown, token: string) =>
      request<Order>('/orders', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      }),
    list: (token: string) => request<Order[]>('/orders', { headers: getHeaders(token) }),
    get: (id: string, token: string) =>
      request<Order>(`/orders/${id}`, { headers: getHeaders(token) }),
  },

  user: {
    profile: (token: string) =>
      request<User>('/auth/me', { headers: getHeaders(token) }),
    update: (data: Partial<User>, token: string) =>
      request<User>('/auth/me', {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(data),
      }),
  },

  ads: {
    placements: (slot: string) => request<{ items: AdPlacement[] }>(`/ads?slot=${encodeURIComponent(slot)}`),
    impression: (id: string) =>
      request<{ ok: boolean }>(`/ads/${id}/impression`, { method: 'POST', headers: getHeaders() }),
    click: (id: string) =>
      request<{ ok: boolean }>(`/ads/${id}/click`, { method: 'POST', headers: getHeaders() }),
  },

  notifications: {
    list: (token: string) =>
      request<{ items: AppNotification[] }>('/notifications', { headers: getHeaders(token) }),
    registerDevice: (body: { token: string; platform: string }, token: string) =>
      request<unknown>('/notifications/devices', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
  },
}
