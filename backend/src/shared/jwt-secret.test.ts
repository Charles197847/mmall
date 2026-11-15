import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { JwtSecretError, assertProductionJwtSecret, getJwtSecret } from './jwt-secret.js'

const strong = 'a'.repeat(48)

describe('JWT_SECRET production gate (MM-QA-032)', () => {
  it('allows a missing secret outside production and uses the dev fallback', () => {
    assert.doesNotThrow(() => assertProductionJwtSecret({ NODE_ENV: 'development' }))
    assert.equal(getJwtSecret({ NODE_ENV: 'development' }), 'dev-only-change-me')
    assert.equal(getJwtSecret({ NODE_ENV: 'test', JWT_SECRET: strong }), strong)
  })

  it('refuses to use a missing, short, or placeholder secret in production', () => {
    const cases = [
      { NODE_ENV: 'production' },
      { NODE_ENV: 'production', JWT_SECRET: 'short' },
      { NODE_ENV: 'production', JWT_SECRET: 'change-me-to-a-long-random-secret' },
      { NODE_ENV: 'production', JWT_SECRET: 'dev-only-change-me' },
      { NODE_ENV: 'production', JWT_SECRET: 'secret' },
    ]
    for (const env of cases) {
      assert.throws(() => assertProductionJwtSecret(env), JwtSecretError)
      assert.throws(() => getJwtSecret(env), JwtSecretError)
    }
  })

  it('accepts a long unique secret in production', () => {
    const env = { NODE_ENV: 'production', JWT_SECRET: strong }
    assert.doesNotThrow(() => assertProductionJwtSecret(env))
    assert.equal(getJwtSecret(env), strong)
  })
})
