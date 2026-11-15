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

export function paygateReturnUrl(env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.PAYGATE_RETURN_URL?.trim()
  if (configured) return configured
  const shop = env.VENDOR_DASHBOARD_URL?.trim()
  if (shop) return `${stripTrailingSlash(shop)}${SHOP_RETURN_PATH}`
  if (env.NODE_ENV === 'production') return `${PRODUCTION_SHOP_ORIGIN}${SHOP_RETURN_PATH}`
  const front = stripTrailingSlash(env.FRONTEND_URL?.trim() || 'http://localhost:8081')
  return `${front}/cart/payment-return`
}

export function paygateNotifyUrl(env: NodeJS.ProcessEnv = process.env): string {
  return `${apiPublicUrl(env)}/api/v1/payments/paygate/notify`
}

export function safeReturnUrl(url: string | undefined, env: NodeJS.ProcessEnv = process.env): string {
  const fallback = paygateReturnUrl(env)
  if (!url) return fallback
  const native = url.startsWith('mmall://') || url.startsWith('exp://')
  const browser =
    url.startsWith('https://') || url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')
  if (!native && !browser) return fallback
  if (env.NODE_ENV === 'production' && !native && (isLocalhostUrl(url) || url.startsWith('http://'))) {
    return fallback
  }
  return url
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
    ['PayGate return URL', paygateReturnUrl(env)],
    ['PayGate notify URL', paygateNotifyUrl(env)],
  ]
  for (const [name, value] of checks) {
    if (!value.startsWith('https://') || isLocalhostUrl(value)) {
      throw new Error(`Refusing to start: ${name} must be https and must not point at localhost (${value}).`)
    }
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
