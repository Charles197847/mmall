import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { quoteCourierGuy } from './quotes.js'

describe('courier guy quotes', () => {
  it('prices local Johannesburg overnight higher than economy', () => {
    const quotes = quoteCourierGuy({ collectionCity: 'Sandton', deliveryCity: 'Johannesburg', weightKg: 1 })
    const eco = quotes.find((item) => item.serviceLevelCode === 'ECO')
    const ovn = quotes.find((item) => item.serviceLevelCode === 'OVN')
    const sdd = quotes.find((item) => item.serviceLevelCode === 'SDD')
    assert.equal(eco?.available, true)
    assert.equal(ovn?.available, true)
    assert.equal(sdd?.available, true)
    assert.ok((ovn?.amount ?? 0) > (eco?.amount ?? 0))
  })

  it('blocks same-day outside metro pairs', () => {
    const quotes = quoteCourierGuy({ collectionCity: 'Johannesburg', deliveryCity: 'Bloemfontein', weightKg: 2 })
    const sdd = quotes.find((item) => item.serviceLevelCode === 'SDD')
    assert.equal(sdd?.available, false)
  })
})
