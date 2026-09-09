import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { signToken } from './auth.js'

describe('signToken', () => {
  it('returns a JWT string', () => {
    const token = signToken({
      sub: 'user_1',
      email: 'a@b.com',
      role: 'CUSTOMER',
    })
    assert.equal(typeof token, 'string')
    assert.ok(token.split('.').length === 3)
  })
})
