import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { paygateChecksum, verifyChecksum } from './checksum.js'

describe('paygate checksum', () => {
  it('matches PayWeb3 concatenated MD5 with key', () => {
    const checksum = paygateChecksum(
      ['10011072130', 'pgtest_123456789', 3299, 'ZAR', 'https://my.return.url/page', '2018-01-01 12:00:00', 'en-za', 'ZAF', 'customer@paygate.co.za'],
      'secret',
    )
    assert.equal(checksum.length, 32)
    assert.equal(verifyChecksum(['10011072130', 'pgtest_123456789'], checksum, 'secret'), false)
    const short = paygateChecksum(['10011072130', 'ref'], 'secret')
    assert.equal(verifyChecksum(['10011072130', 'ref'], short, 'secret'), true)
  })
})
