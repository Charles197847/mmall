import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultPlatformSettings } from './fees.js'
import { campaignWeeks, priceForSlot, pushBlastPrice } from './ads.js'

test('homepage banner is R1500 per week', () => {
  const startsAt = new Date('2026-09-01T00:00:00Z')
  const endsAt = new Date('2026-09-15T00:00:00Z')
  assert.equal(campaignWeeks(startsAt, endsAt), 2)
  assert.equal(
    priceForSlot('HOMEPAGE_BANNER', defaultPlatformSettings, { startsAt, endsAt }),
    3000,
  )
})

test('push blast scales between R5000 and R10000 for 200k users', () => {
  assert.equal(pushBlastPrice(defaultPlatformSettings, 0), 5000)
  assert.equal(pushBlastPrice(defaultPlatformSettings, 200000), 10000)
  assert.equal(pushBlastPrice(defaultPlatformSettings, 100000), 7500)
})
