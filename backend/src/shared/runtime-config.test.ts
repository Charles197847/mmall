import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCTION_ADMIN_ORIGIN,
  PRODUCTION_API_ORIGIN,
  PRODUCTION_APP_ORIGIN,
  PRODUCTION_SHOP_ORIGIN,
  apiPublicUrl,
  assertProductionConfig,
  paygateNotifyUrl,
  paygateReturnUrl,
  resolveCorsOrigins,
  safeReturnUrl,
} from './runtime-config.js'

const secret = 'production-jwt-secret-value-with-enough-length'

describe('deployed origins', () => {
  it('includes the three public web origins and drops localhost in production', () => {
    const origins = resolveCorsOrigins({
      NODE_ENV: 'production',
      CORS_ORIGINS: 'http://localhost:3001,https://mmall-preview.vercel.app',
      VENDOR_DASHBOARD_URL: 'http://127.0.0.1:3001',
    })
    assert.ok(origins.includes(PRODUCTION_SHOP_ORIGIN))
    assert.ok(origins.includes(PRODUCTION_ADMIN_ORIGIN))
    assert.ok(origins.includes(PRODUCTION_APP_ORIGIN))
    assert.ok(origins.includes('https://mmall-preview.vercel.app'))
    assert.equal(origins.some((origin) => origin.includes('localhost') || origin.includes('127.0.0.1')), false)
  })

  it('keeps localhost origins for local development', () => {
    const origins = resolveCorsOrigins({ NODE_ENV: 'development' })
    assert.ok(origins.includes('http://localhost:3001'))
    assert.ok(origins.includes(PRODUCTION_SHOP_ORIGIN))
  })

  it('derives PayGate return and notify URLs from the deployed hosts', () => {
    const env = { NODE_ENV: 'production', JWT_SECRET: secret }
    assert.equal(paygateReturnUrl(env), `${PRODUCTION_SHOP_ORIGIN}/shop/checkout/payment-return`)
    assert.equal(apiPublicUrl(env), PRODUCTION_API_ORIGIN)
    assert.equal(paygateNotifyUrl(env), `${PRODUCTION_API_ORIGIN}/api/v1/payments/paygate/notify`)
    assert.equal(
      safeReturnUrl('http://localhost:3001/shop/checkout/payment-return', env),
      `${PRODUCTION_SHOP_ORIGIN}/shop/checkout/payment-return`,
    )
    assert.equal(safeReturnUrl('mmall://cart/payment-return', env), 'mmall://cart/payment-return')
  })

  it('refuses to start production when a public URL points at localhost', () => {
    assert.throws(() =>
      assertProductionConfig({
        NODE_ENV: 'production',
        JWT_SECRET: secret,
        API_PUBLIC_URL: 'http://localhost:4000',
      }),
    )
    assert.doesNotThrow(() =>
      assertProductionConfig({
        NODE_ENV: 'production',
        JWT_SECRET: secret,
        API_PUBLIC_URL: PRODUCTION_API_ORIGIN,
        PAYGATE_RETURN_URL: `${PRODUCTION_SHOP_ORIGIN}/shop/checkout/payment-return`,
        PAYGATE_MODE: 'mock',
      }),
    )
  })
})
