import assert from 'node:assert/strict'
import { test } from 'node:test'
import { consumeGenerationQuota, quotaSnapshot } from './generation.js'
import { defaultPlatformSettings } from './fees.js'

test('five free generations then paid credits then hard block', () => {
  let usage = { freeUsed: 0, paidCredits: 0 }
  for (let i = 0; i < 5; i += 1) {
    const step = consumeGenerationQuota(usage)
    assert.equal(step.billedAs, 'FREE')
    usage = step.next
  }
  assert.equal(consumeGenerationQuota(usage).billedAs, 'BLOCKED')
  usage = { freeUsed: 5, paidCredits: 2 }
  const paid = consumeGenerationQuota(usage)
  assert.equal(paid.billedAs, 'PAID')
  assert.equal(paid.next.paidCredits, 1)
})

test('logo overage costs R299', () => {
  const quota = quotaSnapshot('LOGO', { freeUsed: 5, paidCredits: 0 }, defaultPlatformSettings)
  assert.equal(quota.canGenerate, false)
  assert.equal(quota.unitPrice, 299)
  assert.equal(quota.freeRemaining, 0)
})
