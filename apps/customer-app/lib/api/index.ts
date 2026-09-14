import { Platform } from 'react-native'
import Constants from 'expo-constants'
import type {
  AdCampaign,
  AdPlacement,
  AdSlot,
  AppNotification,
  GenerationJob,
  GenerationQuota,
  Order,
  Paginated,
  PlatformSettings,
  Product,
  Shipment,
  ShippingQuote,
  User,
  Vendor,
  VendorAnalytics,
  VendorKyc,
  VendorOrderRow,
} from '@shopping-mall/shared-types'

function lanHost() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.linkingUri
  const match = hostUri?.match(/(\d+\.\d+\.\d+\.\d+)/)
  return match?.[1]
}

function getBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api/v1'
  }
  const host = lanHost()
  if (host) return `http://${host}:4000/api/v1`
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000/api/v1'
  return 'http://localhost:4000/api/v1'
}

export const API_BASE = getBaseUrl()

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
        body: JSON.stringify({ ...data, role: 'CUSTOMER' }),
      })
      return res.json() as Promise<AuthResponse>
    },
    sendEmailOtp: (body: {
      email: string
      purpose?: 'login' | 'signup'
      role?: 'CUSTOMER' | 'VENDOR'
      firstName?: string
      lastName?: string
    }) =>
      request<{ otpId: string; demoCode?: string }>('/auth/email-otp/send', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ role: 'CUSTOMER', ...body }),
      }),
    verifyEmailOtp: (body: { otpId: string; code: string }) =>
      request<AuthResponse>('/auth/email-otp/verify', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }),
    sendMagicLink: (body: {
      email: string
      purpose?: 'login' | 'signup'
      role?: 'CUSTOMER' | 'VENDOR'
      firstName?: string
      lastName?: string
    }) =>
      request<{ ok: boolean; demoLink?: string }>('/auth/magic/send', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ role: 'CUSTOMER', ...body }),
      }),
    consumeMagic: (token: string) =>
      request<AuthResponse>('/auth/magic/consume', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ token }),
      }),
    startOAuth: (provider: 'google' | 'apple', role: 'CUSTOMER' | 'VENDOR' = 'CUSTOMER') =>
      request<{ url?: string; error?: string }>('/auth/oauth/' + provider + '/start', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ role }),
      }),
    sendOtp: (body: { phone: string }) =>
      request<{ otpId: string; demoCode?: string }>('/auth/otp/send', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }),
    registerVendor: (body: {
      fullName: string
      email: string
      phone: string
      password: string
      otpId: string
      otpCode: string
      storeName?: string
    }) =>
      request<AuthResponse>('/auth/register/vendor', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }),
    me: (token: string) =>
      request<User & { vendor?: Vendor | null }>('/auth/me', {
        headers: getHeaders(token),
      }),
    updateAddress: (
      body: {
        fullName?: string
        line1?: string
        street?: string
        city: string
        state?: string
        postalCode: string
        country?: string
      },
      token: string,
    ) =>
      request<User>('/auth/address', {
        method: 'PATCH',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
    passkeyRegisterOptions: (token: string) =>
      request<Record<string, unknown>>('/auth/passkeys/register/options', {
        method: 'POST',
        headers: getHeaders(token),
      }),
    passkeyRegisterVerify: (body: unknown, token: string) =>
      request<{ ok: boolean }>('/auth/passkeys/register/verify', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
    passkeyAuthOptions: (email?: string) =>
      request<Record<string, unknown>>('/auth/passkeys/authenticate/options', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      }),
    passkeyAuthVerify: (body: unknown) =>
      request<AuthResponse>('/auth/passkeys/authenticate/verify', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
      }),
    passkeys: (token: string) =>
      request<{ items: Array<{ id: string; createdAt: string; backedUp: boolean }> }>('/auth/passkeys', {
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
    analytics: (token: string) =>
      request<VendorAnalytics>('/vendors/store/analytics', { headers: getHeaders(token) }),
    update: (body: Partial<Vendor>, token: string) =>
      request<Vendor>('/vendors/store', {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
    pricing: (token: string) =>
      request<PlatformSettings>('/vendors/store/pricing', { headers: getHeaders(token) }),
    products: {
      list: (token: string) =>
        request<Paginated<Product>>('/products/mine', { headers: getHeaders(token) }),
      create: (body: Partial<Product>, token: string) =>
        request<Product>('/products', {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Partial<Product>, token: string) =>
        request<Product>(`/products/${id}`, {
          method: 'PUT',
          headers: getHeaders(token),
          body: JSON.stringify(body),
        }),
      delete: (id: string, token: string) =>
        request<void>(`/products/${id}`, { method: 'DELETE', headers: getHeaders(token) }),
    },
    orders: {
      list: (token: string) => request<VendorOrderRow[]>('/orders', { headers: getHeaders(token) }),
      updateStatus: (orderId: string, status: string, token: string) =>
        request<VendorOrderRow>(`/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: getHeaders(token),
          body: JSON.stringify({ status }),
        }),
      bookCourier: (vendorOrderId: string, token: string, serviceLevelCode: 'ECO' | 'OVN' | 'SDD' = 'ECO') =>
        request<Shipment>(`/shipping/vendor-orders/${vendorOrderId}/book`, {
          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify({ serviceLevelCode }),
        }),
    },
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

  shipping: {
    quote: (body: {
      items: Array<{ productId: string; quantity: number }>
      address: { city: string; postalCode?: string; street?: string; state?: string }
    }) =>
      request<{ quotes: ShippingQuote[]; weightKg: number }>(
        '/shipping/quote',
        { method: 'POST', headers: getHeaders(), body: JSON.stringify(body) },
      ),
    track: (trackingNumber: string) => request(`/shipping/track/${trackingNumber}`),
    advance: (shipmentId: string, token: string) =>
      request<Shipment>(`/shipping/${shipmentId}/advance`, {
        method: 'POST',
        headers: getHeaders(token),
      }),
  },

  payments: {
    registerPayout: (token: string) =>
      request<{ beneficiaryId: string; provider: string; message: string }>('/payments/payouts/register', {
        method: 'POST',
        headers: getHeaders(token),
      }),
  },

  studio: {
    quota: (token: string) =>
      request<{ items: GenerationQuota[] }>('/studio/quota', { headers: getHeaders(token) }),
    jobs: (token: string) =>
      request<{ items: GenerationJob[] }>('/studio/jobs', { headers: getHeaders(token) }),
    generate: (body: { assetType: 'LOGO' | 'BANNER'; prompt: string }, token: string) =>
      request<{ job: GenerationJob; quota: GenerationQuota }>('/studio/generate', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
    topup: (body: { assetType: 'LOGO' | 'BANNER'; quantity: number }, token: string) =>
      request<{ quota: GenerationQuota; charged: number; currency: string }>('/studio/topup', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
    apply: (body: { jobId: string }, token: string) =>
      request<{ job: GenerationJob; vendor: Vendor }>('/studio/apply', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
  },

  kyc: {
    me: (token: string) => request<VendorKyc>('/kyc/me', { headers: getHeaders(token) }),
    submit: (body: Record<string, unknown>, token: string) =>
      request<VendorKyc>('/kyc/submit', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
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
    mine: (token: string) => request<{ items: AdCampaign[] }>('/ads/mine', { headers: getHeaders(token) }),
    create: (
      body: {
        slot: AdSlot
        title: string
        headline?: string
        imageUrl?: string
        startsAt: string
        endsAt: string
        audienceSize?: number
      },
      token: string,
    ) =>
      request<AdCampaign>('/ads', {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(body),
      }),
    purchase: (id: string, token: string) =>
      request<AdCampaign>(`/ads/${id}/purchase`, { method: 'POST', headers: getHeaders(token) }),
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
