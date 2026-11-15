import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { DemoSeedError, assertDemoSeedAllowed } from './demo-seed.js'

const local = 'postgresql://postgres:postgres@localhost:5433/shopping_mall'
const supabase = 'postgresql://postgres.abc:secret@aws-0-eu-central-1.pooler.supabase.com:5432/postgres'
const direct = 'postgresql://postgres:secret@db.abcdefghijklmnopqrst.supabase.co:5432/postgres'

describe('demo seed guard', () => {
  it('allows the local docker database without the flag', () => {
    assert.doesNotThrow(() =>
      assertDemoSeedAllowed({ NODE_ENV: 'development', DATABASE_URL: local, DIRECT_URL: local }),
    )
    assert.doesNotThrow(() =>
      assertDemoSeedAllowed({
        NODE_ENV: 'development',
        DATABASE_URL: 'postgresql://postgres:postgres@postgres:5432/shopping_mall',
      }),
    )
  })

  it('refuses a hosted database unless ALLOW_DEMO_SEED=true', () => {
    assert.throws(
      () => assertDemoSeedAllowed({ NODE_ENV: 'development', DATABASE_URL: supabase, DIRECT_URL: direct }),
      DemoSeedError,
    )
    assert.throws(
      () => assertDemoSeedAllowed({ NODE_ENV: 'production', DATABASE_URL: local }),
      DemoSeedError,
    )
    assert.doesNotThrow(() =>
      assertDemoSeedAllowed({
        NODE_ENV: 'production',
        DATABASE_URL: supabase,
        DIRECT_URL: direct,
        ALLOW_DEMO_SEED: 'true',
      }),
    )
  })
})
