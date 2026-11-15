import { assertProductionJwtSecret } from './jwt-secret.js'

export const PRODUCTION_SHOP_ORIGIN = 'https://mmall.meeronixgroup.co.za'
export const PRODUCTION_ADMIN_ORIGIN = 'https://mmall-admin.meeronixgroup.co.za'
export const PRODUCTION_APP_ORIGIN = 'https://mmall-app.meeronixgroup.co.za'
export const PRODUCTION_API_ORIGIN = 'https://mmall-api.meeronixgroup.co.za'

export const PRODUCTION_WEB_ORIGINS = [
  PRODUCTION_SHOP_ORIGIN,
  PRODUCTION_ADMIN_ORIGIN,
  PRODUCTION_APP_ORIGIN,
] as const

const SHOP_RETURN_PATH = '/shop/checkout/payment-return'
const APP_RETURN_PATH = '/cart/payment-return'
const DEV_ORIGINS = [
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:8081',
  'http://localhost:8085',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:8081',
  'http://127.0.0.1:8085',
]

function splitList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/$/, '')
}

export function isLocalhostUrl(value: string): boolean {
  try {
    const host = new URL(value).hostname.toLowerCase()
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.localhost')
  } catch {
    return /localhost|127\.0\.0\.1/i.test(value)
  }
}

function configuredAppOrigins(env: NodeJS.ProcessEnv): string[] {
  return [env.VENDOR_DASHBOARD_URL, env.ADMIN_PANEL_URL, env.FRONTEND_URL, env.PUBLIC_SHOP_ORIGIN]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .map(stripTrailingSlash)
}

export function resolveCorsOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const production = env.NODE_ENV === 'production'
  const merged = [
    ...PRODUCTION_WEB_ORIGINS,
    ...(production ? [] : DEV_ORIGINS),
    ...configuredAppOrigins(env),
    ...splitList(env.CORS_ORIGINS),
  ].map(stripTrailingSlash)
  const unique = [...new Set(merged)]
  return production ? unique.filter((origin) => !isLocalhostUrl(origin)) : unique
}

export function apiPublicUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.API_PUBLIC_URL?.trim()
  if (configured) return stripTrailingSlash(configured)
  if (env.NODE_ENV === 'production') return PRODUCTION_API_ORIGIN
  return `http://localhost:${env.PORT ?? 4000}`
}

export function shopPaygateReturnUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.VENDOR_DASHBOARD_URL?.trim()
  const origin = configured
    ? stripTrailingSlash(configured)
    : env.NODE_ENV === 'production'
      ? PRODUCTION_SHOP_ORIGIN
      : 'http://localhost:3001'
  return `${origin}${SHOP_RETURN_PATH}`
}

export function appPaygateReturnUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.FRONTEND_URL?.trim()
  const origin = configured
    ? stripTrailingSlash(configured)
    : env.NODE_ENV === 'production'
      ? PRODUCTION_APP_ORIGIN
      : 'http://localhost:8081'
  return `${origin}${APP_RETURN_PATH}`
}

/** Full return URLs PayGate may send a browser back to. The client picks one. */
export function paygateReturnAllowlist(env: NodeJS.ProcessEnv = process.env): string[] {
  const production = env.NODE_ENV === 'production'
  const shopOrigins = [
    PRODUCTION_SHOP_ORIGIN,
    env.VENDOR_DASHBOARD_URL?.trim(),
    ...(production ? [] : ['http://localhost:3001', 'http://127.0.0.1:3001']),
  ]
  const appOrigins = [
    PRODUCTION_APP_ORIGIN,
    env.FRONTEND_URL?.trim(),
    ...(production ? [] : ['http://localhost:8081', 'http://127.0.0.1:8081', 'http://localhost:8085', 'http://127.0.0.1:8085']),
  ]
  const fromOrigins = [
    ...shopOrigins.filter((origin): origin is string => Boolean(origin)).map((origin) => `${stripTrailingSlash(origin)}${SHOP_RETURN_PATH}`),
    ...appOrigins.filter((origin): origin is string => Boolean(origin)).map((origin) => `${stripTrailingSlash(origin)}${APP_RETURN_PATH}`),
  ]
  const extras = [...splitList(env.PAYGATE_RETURN_URLS), ...splitList(env.PAYGATE_RETURN_URL)]
  const unique = [...new Set([...fromOrigins, ...extras].map(stripTrailingSlash))]
  return production ? unique.filter((url) => url.startsWith('https://') && !isLocalhostUrl(url)) : unique
}

export function paygateNotifyUrl(env: NodeJS.ProcessEnv = process.env): string {
  return `${apiPublicUrl(env)}/api/v1/payments/paygate/notify`
}

function browserReturnKey(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null
    const path = parsed.pathname.replace(/\/$/, '') || '/'
    return `${parsed.origin}${path}`
  } catch {
    return null
  }
}

function nativeReturnUrl(url: string): string | null {
  if (!url.startsWith('mmall://') && !url.startsWith('exp://')) return null
  try {
    const parsed = new URL(url)
    const path = `/${parsed.hostname}${parsed.pathname}`.replace(/\/+$/, '')
    if (!path.endsWith('/cart/payment-return') && path !== '/payment-return') return null
    return url
  } catch {
    return null
  }
}

/**
 * Use the return URL the checkout client sent when it is on the allowlist.
 * Shop web and Expo web are different entries. There is no single global return.
 */
export function resolvePaygateReturnUrl(requested: string | undefined, env: NodeJS.ProcessEnv = process.env): string | null {
  if (!requested) return null
  const native = nativeReturnUrl(requested)
  if (native) {
    if (env.NODE_ENV === 'production' && isLocalhostUrl(native)) return null
    return native
  }
  const key = browserReturnKey(requested)
  if (!key) return null
  if (env.NODE_ENV === 'production' && (isLocalhostUrl(key) || key.startsWith('http://'))) return null
  const match = paygateReturnAllowlist(env).find((entry) => browserReturnKey(entry) === key)
  return match ? key : null
}

export function webauthnRpId(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.WEBAUTHN_RP_ID?.trim()
  if (env.NODE_ENV === 'production') {
    if (!configured || configured === 'localhost' || configured === '127.0.0.1') return 'meeronixgroup.co.za'
    return configured
  }
  return configured || 'localhost'
}

export function webauthnOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const extra = splitList(env.WEBAUTHN_ORIGINS)
  if (env.NODE_ENV !== 'production') {
    return extra.length
      ? extra
      : ['http://localhost:8081', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:8081']
  }
  return [...new Set([...PRODUCTION_WEB_ORIGINS, ...extra, ...configuredAppOrigins(env)])].filter(
    (origin) => !isLocalhostUrl(origin),
  )
}

export function assertProductionConfig(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') return
  assertProductionJwtSecret(env)

  const checks: Array<[string, string]> = [
    ['API_PUBLIC_URL', apiPublicUrl(env)],
    ['PayGate notify URL', paygateNotifyUrl(env)],
  ]
  for (const [name, value] of checks) {
    if (!value.startsWith('https://') || isLocalhostUrl(value)) {
      throw new Error(`Refusing to start: ${name} must be https and must not point at localhost (${value}).`)
    }
  }

  const returns = paygateReturnAllowlist(env)
  const shopReturn = `${PRODUCTION_SHOP_ORIGIN}${SHOP_RETURN_PATH}`
  const appReturn = `${PRODUCTION_APP_ORIGIN}${APP_RETURN_PATH}`
  if (!returns.includes(shopReturn) || !returns.includes(appReturn)) {
    throw new Error('Refusing to start: PayGate return allowlist must include the shop and Expo web return URLs.')
  }
  if (returns.some((url) => isLocalhostUrl(url))) {
    throw new Error('Refusing to start: PayGate return allowlist contains a localhost URL.')
  }

  const mode = (env.PAYGATE_MODE ?? 'mock').trim().toLowerCase()
  if (mode !== 'mock' && mode !== 'sandbox') {
    throw new Error('Refusing to start: PAYGATE_MODE must stay mock. Live PayGate is not wired.')
  }

  const origins = resolveCorsOrigins(env)
  for (const required of PRODUCTION_WEB_ORIGINS) {
    if (!origins.includes(required)) {
      throw new Error(`Refusing to start: CORS allowlist is missing ${required}.`)
    }
  }
  if (origins.some((origin) => isLocalhostUrl(origin))) {
    throw new Error('Refusing to start: CORS allowlist contains a localhost origin.')
  }
}
