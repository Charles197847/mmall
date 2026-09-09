import assert from 'node:assert/strict'
import { test } from 'node:test'
import { defaultPlatformSettings, settleVendorSale } from './fees.js'

test('R1000 fashion sale nets R823 after 15% commission and gateway fee', () => {
  const settlement = settleVendorSale({
    items: [{ total: 1000, category: 'Fashion' }],
    orderTotal: 1000,
    settings: defaultPlatformSettings,
  })

  assert.equal(settlement.commission, 150)
  assert.equal(settlement.gatewayFee, 27)
  assert.equal(settlement.payoutAmount, 823)
})

test('electronics uses the 5% category rate', () => {
  const settlement = settleVendorSale({
    items: [{ total: 2000, category: 'Electronics' }],
    orderTotal: 2000,
    settings: defaultPlatformSettings,
  })

  assert.equal(settlement.commission, 100)
  assert.equal(settlement.gatewayFee, 52)
  assert.equal(settlement.payoutAmount, 1848)
})
