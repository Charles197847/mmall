import type {
  AdminUser,
  AdCampaign,
  AdPlacement,
  AppNotification,
  AuthResponse,
  GenerationJob,
  GenerationQuota,
  Order,
  Paginated,
  PaygateInitiateResponse,
  PlatformSettings,
  PlatformStats,
  Product,
  Shipment,
  ShippingQuote,
  User,
  Vendor,
  VendorAnalytics,
  VendorKyc,
  VendorOrderRow,
} from '@shopping-mall/shared-types'

export type ApiClientOptions = {
  baseUrl: string
  getToken?: () => string | null | Promise<string | null>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  options: ApiClientOptions,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await options.getToken?.()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${options.baseUrl}${path}`, { ...init, headers })
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const payload = data as { error?: string; code?: string }
    throw new ApiError(payload.error ?? `Request failed: ${response.status}`, response.status, payload.code)
  }
  return data as T
}

export function createApiClient(options: ApiClientOptions) {
  return {
    auth: {
      register: (body: {
        email: string
        password: string
        firstName: string
        lastName: string
        role?: 'CUSTOMER' | 'VENDOR'
      }) => request<AuthResponse>(options, '/auth/register', { method: 'POST', body: JSON.stringify(body) }),
      login: (body: { email: string; password: string }) =>
        request<AuthResponse>(options, '/auth/login', { method: 'POST', body: JSON.stringify(body) }),
      sendOtp: (body: { phone: string }) =>
        request<{ otpId: string; demoCode?: string }>(options, '/auth/otp/send', {
          method: 'POST',
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
        request<AuthResponse>(options, '/auth/register/vendor', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      me: () => request<User & { vendor?: Vendor | null; kyc?: VendorKyc | null }>(options, '/auth/me'),
      updateAddress: (body: {
        fullName?: string
        line1?: string
        street?: string
        city: string
        state?: string
        postalCode: string
        country?: string
      }) => request<User>(options, '/auth/address', { method: 'PATCH', body: JSON.stringify(body) }),
      passkeyRegisterOptions: () =>
        request<Record<string, unknown>>(options, '/auth/passkeys/register/options', { method: 'POST' }),
      passkeyRegisterVerify: (body: unknown) =>
        request<{ ok: boolean }>(options, '/auth/passkeys/register/verify', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      passkeyAuthOptions: (email?: string) =>
        request<Record<string, unknown>>(options, '/auth/passkeys/authenticate/options', {
          method: 'POST',
          body: JSON.stringify({ email }),
        }),
      passkeyAuthVerify: (body: unknown) =>
        request<AuthResponse>(options, '/auth/passkeys/authenticate/verify', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      passkeys: () =>
        request<{ items: Array<{ id: string; createdAt: string; backedUp: boolean; deviceType: string }> }>(
          options,
          '/auth/passkeys',
        ),
      sendEmailOtp: (body: {
        email: string
        purpose?: 'login' | 'signup'
        role?: 'CUSTOMER' | 'VENDOR'
        firstName?: string
        lastName?: string
      }) =>
        request<{ otpId: string; demoCode?: string }>(options, '/auth/email-otp/send', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      verifyEmailOtp: (body: { otpId: string; code: string }) =>
        request<AuthResponse>(options, '/auth/email-otp/verify', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      sendMagicLink: (body: {
        email: string
        purpose?: 'login' | 'signup'
        role?: 'CUSTOMER' | 'VENDOR'
        firstName?: string
        lastName?: string
      }) =>
        request<{ sent: boolean; demoLink?: string }>(options, '/auth/magic/send', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      consumeMagic: (token: string) =>
        request<AuthResponse>(options, '/auth/magic/consume', {
          method: 'POST',
          body: JSON.stringify({ token }),
        }),
      startOAuth: (provider: 'google' | 'apple', role: 'CUSTOMER' | 'VENDOR') =>
        request<{ error?: string }>(options, `/auth/oauth/${provider}/start`, {
          method: 'POST',
          body: JSON.stringify({ role }),
        }),
    },
    products: {
      list: (query: Record<string, string | number | undefined> = {}) => {
        const params = new URLSearchParams()
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== '') params.set(key, String(value))
        })
        const qs = params.toString()
        return request<Paginated<Product>>(options, `/products${qs ? `?${qs}` : ''}`)
      },
      get: (id: string) => request<Product>(options, `/products/${id}`),
      create: (body: Partial<Product>) =>
        request<Product>(options, '/products', { method: 'POST', body: JSON.stringify(body) }),
      update: (id: string, body: Partial<Product>) =>
        request<Product>(options, `/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
      delete: (id: string) => request<void>(options, `/products/${id}`, { method: 'DELETE' }),
    },
    vendors: {
      list: () => request<Vendor[]>(options, '/vendors'),
      getBySlug: (slug: string) => request<Vendor>(options, `/vendors/${slug}`),
      onboard: (body: { storeName: string; description?: string }) =>
        request<Vendor>(options, '/vendors/onboard', { method: 'POST', body: JSON.stringify(body) }),
      update: (body: Partial<Vendor>) =>
        request<Vendor>(options, '/vendors/store', { method: 'PUT', body: JSON.stringify(body) }),
      analytics: () => request<VendorAnalytics>(options, '/vendors/store/analytics'),
      pricing: () => request<PlatformSettings>(options, '/vendors/store/pricing'),
      products: {
        list: () => request<Paginated<Product>>(options, '/products/mine'),
        create: (body: Partial<Product>) =>
          request<Product>(options, '/products', { method: 'POST', body: JSON.stringify(body) }),
        update: (id: string, data: Partial<Product>) =>
          request<Product>(options, `/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => request<void>(options, `/products/${id}`, { method: 'DELETE' }),
      },
      orders: {
        list: () => request<VendorOrderRow[]>(options, '/orders'),
        updateStatus: (orderId: string, body: { status: string }) =>
          request<VendorOrderRow>(options, `/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(body),
          }),
        bookCourier: (vendorOrderId: string, body: { serviceLevelCode?: 'ECO' | 'OVN' | 'SDD' } = {}) =>
          request<Shipment>(options, `/shipping/vendor-orders/${vendorOrderId}/book`, {
            method: 'POST',
            body: JSON.stringify(body),
          }),
      },
    },
    orders: {
      create: (body: {
        items: Array<{ productId: string; quantity: number }>
        shippingAddress: Record<string, unknown>
        billingAddress?: Record<string, unknown>
        shippingServiceCode?: 'ECO' | 'OVN' | 'SDD'
        paymentReturnUrl?: string
      }) => request<Order>(options, '/orders', { method: 'POST', body: JSON.stringify(body) }),
      list: () => request<Order[]>(options, '/orders'),
      get: (id: string) => request<Order>(options, `/orders/${id}`),
    },
    payments: {
      initiatePaygate: (body: { orderId: string }) =>
        request<PaygateInitiateResponse>(options, '/payments/paygate/initiate', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      registerPayout: () =>
        request<{ beneficiaryId: string; provider: string; message: string }>(options, '/payments/payouts/register', {
          method: 'POST',
        }),
    },
    shipping: {
      quote: (body: {
        items: Array<{ productId: string; quantity: number }>
        address: { city: string; postalCode?: string; state?: string; street?: string; line1?: string }
      }) =>
        request<{ quotes: ShippingQuote[]; weightKg: number; collectionCity: string; deliveryCity: string }>(
          options,
          '/shipping/quote',
          { method: 'POST', body: JSON.stringify(body) },
        ),
      advance: (shipmentId: string) =>
        request<Shipment>(options, `/shipping/${shipmentId}/advance`, { method: 'POST' }),
      track: (trackingNumber: string) => request<Shipment>(options, `/shipping/track/${trackingNumber}`),
    },
    admin: {
      vendors: {
        list: (params: { status?: string } = {}) => {
          const query = params.status && params.status !== 'all' ? `?status=${encodeURIComponent(params.status)}` : ''
          return request<Vendor[]>(options, `/admin/vendors${query}`)
        },
        approve: (id: string) =>
          request<Vendor>(options, `/admin/vendors/${id}/approve`, { method: 'POST' }),
        suspend: (id: string) =>
          request<Vendor>(options, `/admin/vendors/${id}/suspend`, { method: 'POST' }),
        unsuspend: (id: string) =>
          request<Vendor>(options, `/admin/vendors/${id}/unsuspend`, { method: 'POST' }),
        updateCommission: (id: string, commissionRate: number) =>
          request<Vendor>(options, `/admin/vendors/${id}/commission`, {
            method: 'PUT',
            body: JSON.stringify({ commissionRate }),
          }),
      },
      stats: {
        get: () => request<PlatformStats>(options, '/admin/stats'),
        revenue: () =>
          request<Array<{ date?: string; createdAt: string; totalAmount: number }>>(
            options,
            '/admin/stats/revenue',
          ),
      },
      settings: {
        get: () => request<PlatformSettings>(options, '/admin/settings'),
        update: (body: PlatformSettings) =>
          request<PlatformSettings>(options, '/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(body),
          }),
      },
      orders: {
        list: (params: { status?: string } = {}) => {
          const query = params.status && params.status !== 'all' ? `?status=${encodeURIComponent(params.status)}` : ''
          return request<Order[]>(options, `/admin/orders${query}`)
        },
        updateStatus: (id: string, status: string) =>
          request<Order>(options, `/admin/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
          }),
      },
      users: {
        list: () => request<AdminUser[]>(options, '/admin/users'),
        updateRole: (id: string, role: User['role']) =>
          request<AdminUser>(options, `/admin/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
          }),
      },
      ads: {
        list: (params: { status?: string } = {}) => {
          const query = params.status && params.status !== 'all' ? `?status=${encodeURIComponent(params.status)}` : ''
          return request<{ items: AdCampaign[] }>(options, `/admin/ads${query}`)
        },
      },
    },
    search: {
      query: (q: string) => request<{ items: Product[] }>(options, `/search?q=${encodeURIComponent(q)}`),
    },
    studio: {
      quota: () => request<{ items: GenerationQuota[] }>(options, '/studio/quota'),
      jobs: () => request<{ items: GenerationJob[] }>(options, '/studio/jobs'),
      generate: (body: { assetType: 'LOGO' | 'BANNER'; prompt: string }) =>
        request<{ job: GenerationJob; quota: GenerationQuota }>(options, '/studio/generate', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      topup: (body: { assetType: 'LOGO' | 'BANNER'; quantity: number }) =>
        request<{ quota: GenerationQuota; charged: number; currency: string }>(options, '/studio/topup', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      apply: (body: { jobId: string }) =>
        request<{ job: GenerationJob; vendor: Vendor }>(options, '/studio/apply', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
    },
    ads: {
      placements: (slot?: string) => {
        const qs = slot ? `?slot=${encodeURIComponent(slot)}` : ''
        return request<{ items: AdPlacement[] }>(options, `/ads${qs}`)
      },
      impression: (id: string) =>
        request<{ ok: boolean }>(options, `/ads/${id}/impression`, { method: 'POST' }),
      click: (id: string) => request<{ ok: boolean }>(options, `/ads/${id}/click`, { method: 'POST' }),
      mine: () => request<{ items: AdCampaign[] }>(options, '/ads/mine'),
      create: (body: {
        slot: AdCampaign['slot']
        title: string
        headline?: string
        imageUrl?: string
        linkUrl?: string
        startsAt: string
        endsAt: string
        audienceSize?: number
      }) => request<AdCampaign>(options, '/ads', { method: 'POST', body: JSON.stringify(body) }),
      purchase: (id: string) => request<AdCampaign>(options, `/ads/${id}/purchase`, { method: 'POST' }),
    },
    notifications: {
      list: () => request<{ items: AppNotification[] }>(options, '/notifications'),
      registerDevice: (body: { token: string; platform: string }) =>
        request<unknown>(options, '/notifications/devices', { method: 'POST', body: JSON.stringify(body) }),
    },
    kyc: {
      me: () => request<VendorKyc>(options, '/kyc/me'),
      submit: (body: Record<string, unknown>) =>
        request<VendorKyc>(options, '/kyc/submit', { method: 'POST', body: JSON.stringify(body) }),
      review: (vendorId: string, body: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) =>
        request<VendorKyc>(options, `/kyc/${vendorId}/review`, { method: 'POST', body: JSON.stringify(body) }),
    },
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
