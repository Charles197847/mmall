import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { inventoryDecrements } from './stockPlan.js'

describe('inventoryDecrements', () => {
  it('does not go negative when stock is short', () => {
    const stock = new Map([
      ['mug', 2],
      ['tote', 0],
    ])
    const plan = inventoryDecrements(
      [
        { productId: 'mug', quantity: 5 },
        { productId: 'tote', quantity: 1 },
        { productId: 'missing', quantity: 1 },
      ],
      stock,
    )
    assert.deepEqual(plan, [
      { productId: 'mug', decrement: 2, remaining: 0 },
      { productId: 'tote', decrement: 0, remaining: 0 },
      { productId: 'missing', decrement: 0, remaining: 0 },
    ])
  })

  it('applies sequential lines against the same sku', () => {
    const stock = new Map([['mug', 5]])
    const plan = inventoryDecrements(
      [
        { productId: 'mug', quantity: 2 },
        { productId: 'mug', quantity: 2 },
      ],
      stock,
    )
    assert.equal(plan[0].remaining, 3)
    assert.equal(plan[1].remaining, 1)
    assert.equal(stock.get('mug'), 1)
  })
})
