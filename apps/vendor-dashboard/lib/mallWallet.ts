export const giftCardPresets = [100, 200, 300, 500, 1000, 2000, 5000] as const
export const giftCardMin = 50
export const giftCardMax = 10_000

export type GiftCardRecord = {
  id: string
  amount: number
  remaining: number
  codeHash: string
  last4: string
  createdAt: string
  status: 'active' | 'transferred'
  claimHash?: string
  claimExpiresAt?: number
}

export type IssuedGiftCard = GiftCardRecord & { code: string }

export type ShopVoucher = {
  code: string
  title: string
  shop: string
  slug: string
  detail: string
  percent?: number
  amount?: number
  minSpend: number
  tone: 'navy' | 'rose' | 'teal' | 'amber' | 'violet'
}

type WalletState = {
  cards: GiftCardRecord[]
  vouchers: string[]
  fails: number
  lockedUntil: number
}

const KEY = 'mmall-wallet'
const SESSION_CODES = 'mmall-gift-codes'

export const shopVouchers: ShopVoucher[] = [
  { code: 'VELVET10', title: 'Velvet Lane 10%', shop: 'Velvet Lane', slug: 'velvet-lane', detail: 'Apparel court this week', percent: 10, minSpend: 250, tone: 'rose' },
  { code: 'NORTH50', title: 'R50 off Northline', shop: 'Northline Supply', slug: 'northline-supply', detail: 'Outdoor and tools', amount: 50, minSpend: 400, tone: 'teal' },
  { code: 'HARBOR15', title: 'Harbor Home 15%', shop: 'Harbor Home', slug: 'harbor-home', detail: 'Home court weekend', percent: 15, minSpend: 500, tone: 'amber' },
  { code: 'LUMEN30', title: 'R30 Lumen Beauty', shop: 'Lumen Beauty', slug: 'lumen-beauty', detail: 'Skincare and salon', amount: 30, minSpend: 150, tone: 'violet' },
  { code: 'ATLAS12', title: 'Atlas Sport 12%', shop: 'Atlas Sport', slug: 'atlas-sport', detail: 'Training kit', percent: 12, minSpend: 300, tone: 'navy' },
]

function emptyWallet(): WalletState {
  return { cards: [], vouchers: [], fails: 0, lockedUntil: 0 }
}

function readWallet(): WalletState {
  if (typeof window === 'undefined') return emptyWallet()
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? ({ ...emptyWallet(), ...(JSON.parse(raw) as WalletState) } as WalletState) : emptyWallet()
  } catch {
    return emptyWallet()
  }
}

function writeWallet(state: WalletState) {
  window.localStorage.setItem(KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('mmall-wallet'))
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value)
  const hash = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

function randomCode() {
  const hex = [...randomBytes(10)].map((byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
  return `MM-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`
}

function randomToken() {
  const bytes = randomBytes(24)
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function rememberSessionCode(id: string, code: string) {
  try {
    const raw = sessionStorage.getItem(SESSION_CODES)
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {}
    map[id] = code
    sessionStorage.setItem(SESSION_CODES, JSON.stringify(map))
  } catch {
    return
  }
}

export function sessionGiftCode(id: string) {
  try {
    const raw = sessionStorage.getItem(SESSION_CODES)
    return raw ? ((JSON.parse(raw) as Record<string, string>)[id] ?? null) : null
  } catch {
    return null
  }
}

export function clampGiftAmount(value: number) {
  if (!Number.isFinite(value)) return giftCardMin
  return Math.min(giftCardMax, Math.max(giftCardMin, Math.round(value)))
}

export function walletGiftCards() {
  return readWallet().cards.filter((card) => card.status === 'active')
}

export function walletBalance() {
  return walletGiftCards().reduce((sum, card) => sum + card.remaining, 0)
}

export function savedVoucherCodes() {
  return readWallet().vouchers
}

export function saveVoucher(code: string) {
  const state = readWallet()
  if (!state.vouchers.includes(code)) state.vouchers.push(code)
  writeWallet(state)
}

export async function issueGiftCard(amount: number): Promise<IssuedGiftCard> {
  const value = clampGiftAmount(amount)
  const code = randomCode()
  const record: GiftCardRecord = {
    id: crypto.randomUUID(),
    amount: value,
    remaining: value,
    codeHash: await sha256Hex(code),
    last4: code.slice(-4),
    createdAt: new Date().toISOString(),
    status: 'active',
  }
  const state = readWallet()
  state.cards.push(record)
  writeWallet(state)
  rememberSessionCode(record.id, code)
  return { ...record, code }
}

export function walletLocked() {
  const state = readWallet()
  return Date.now() < state.lockedUntil
}

export async function peekGiftCard(code: string) {
  const state = readWallet()
  if (Date.now() < state.lockedUntil) {
    throw new Error('Too many tries. Wait a few minutes and try again.')
  }
  const hash = await sha256Hex(code.trim().toUpperCase())
  const card = state.cards.find((row) => row.codeHash === hash && row.status === 'active')
  if (!card || card.remaining <= 0) {
    state.fails += 1
    if (state.fails >= 5) {
      state.lockedUntil = Date.now() + 15 * 60 * 1000
      state.fails = 0
    }
    writeWallet(state)
    throw new Error('That code is not valid.')
  }
  state.fails = 0
  writeWallet(state)
  return card
}

export async function redeemGiftCard(code: string, spend: number) {
  const state = readWallet()
  if (Date.now() < state.lockedUntil) {
    throw new Error('Too many tries. Wait a few minutes and try again.')
  }
  const hash = await sha256Hex(code.trim().toUpperCase())
  const card = state.cards.find((row) => row.codeHash === hash && row.status === 'active')
  if (!card || card.remaining <= 0) {
    state.fails += 1
    if (state.fails >= 5) {
      state.lockedUntil = Date.now() + 15 * 60 * 1000
      state.fails = 0
    }
    writeWallet(state)
    throw new Error('That code is not valid.')
  }
  const used = Math.min(card.remaining, Math.max(0, spend))
  card.remaining = Math.round((card.remaining - used) * 100) / 100
  state.fails = 0
  writeWallet(state)
  return { card, used }
}

export async function createShareToken(cardId: string) {
  const state = readWallet()
  const card = state.cards.find((row) => row.id === cardId && row.status === 'active')
  if (!card) throw new Error('Card not found.')
  const token = randomToken()
  card.claimHash = await sha256Hex(token)
  card.claimExpiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000
  writeWallet(state)
  return token
}

export async function claimSharedCard(token: string) {
  const state = readWallet()
  const hash = await sha256Hex(token)
  const card = state.cards.find(
    (row) => row.claimHash === hash && row.status === 'active' && (row.claimExpiresAt ?? 0) > Date.now(),
  )
  if (!card) throw new Error('This share link is invalid or has expired.')
  card.status = 'transferred'
  card.claimHash = undefined
  card.claimExpiresAt = undefined
  const next: GiftCardRecord = {
    ...card,
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: new Date().toISOString(),
  }
  state.cards.push(next)
  writeWallet(state)
  return next
}
