import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { KYC_TIER_RANK } from './kyc.js'

describe('kyc tiers', () => {
  it('ranks explorer below active vendor below enterprise', () => {
    assert.equal(KYC_TIER_RANK.EXPLORER < KYC_TIER_RANK.ACTIVE_VENDOR, true)
    assert.equal(KYC_TIER_RANK.ACTIVE_VENDOR < KYC_TIER_RANK.ENTERPRISE, true)
  })
})
