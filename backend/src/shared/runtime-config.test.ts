import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  PRODUCTION_ADMIN_ORIGIN,
  PRODUCTION_API_ORIGIN,
  PRODUCTION_APP_ORIGIN,
  PRODUCTION_SHOP_ORIGIN,
  apiPublicUrl,
  assertProductionConfig,
  appPaygateReturnUrl,
  paygateNotifyUrl,
  paygateReturnAllowlist,
  resolveCorsOrigins,
  resolvePaygateReturnUrl,
  shopPaygateReturnUrl,
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

  it('keeps a separate PayGate return URL for the shop and for Expo web', () => {
    const env = { NODE_ENV: 'production', JWT_SECRET: secret }
    const shopReturn = `${PRODUCTION_SHOP_ORIGIN}/shop/checkout/payment-return`
    const appReturn = `${PRODUCTION_APP_ORIGIN}/cart/payment-return`
    assert.equal(shopPaygateReturnUrl(env), shopReturn)
    assert.equal(appPaygateReturnUrl(env), appReturn)
    assert.equal(apiPublicUrl(env), PRODUCTION_API_ORIGIN)
    assert.equal(paygateNotifyUrl(env), `${PRODUCTION_API_ORIGIN}/api/v1/payments/paygate/notify`)
    assert.ok(paygateReturnAllowlist(env).includes(shopReturn))
    assert.ok(paygateReturnAllowlist(env).includes(appReturn))
    assert.equal(resolvePaygateReturnUrl(shopReturn, env), shopReturn)
    assert.equal(resolvePaygateReturnUrl(appReturn, env), appReturn)
    assert.equal(resolvePaygateReturnUrl('https://evil.example/shop/checkout/payment-return', env), null)
    assert.equal(resolvePaygateReturnUrl('http://localhost:3001/shop/checkout/payment-return', env), null)
    assert.equal(resolvePaygateReturnUrl('mmall://cart/payment-return', env), 'mmall://cart/payment-return')
    assert.equal(
      resolvePaygateReturnUrl(shopReturn, { ...env, PAYGATE_RETURN_URL: appReturn }),
      shopReturn,
    )
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
