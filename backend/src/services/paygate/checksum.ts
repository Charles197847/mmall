import { createHash } from 'node:crypto'

export const PAYGATE_TEST_ID = process.env.PAYGATE_ID ?? '10011072130'
export const PAYGATE_ENCRYPTION_KEY = process.env.PAYGATE_ENCRYPTION_KEY ?? 'secret'

export function paygateChecksum(fields: Array<string | number | undefined | null>, key = PAYGATE_ENCRYPTION_KEY) {
  const payload = fields.map((value) => (value === undefined || value === null ? '' : String(value))).join('')
  return createHash('md5')
    .update(`${payload}${key}`)
    .digest('hex')
}

export function verifyChecksum(fields: Array<string | number | undefined | null>, checksum: string, key = PAYGATE_ENCRYPTION_KEY) {
  return paygateChecksum(fields, key).toLowerCase() === checksum.toLowerCase()
}
