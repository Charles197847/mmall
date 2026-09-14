import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { nanoid } from 'nanoid'

export const giftCardPresets = [100, 200, 300, 500, 1000, 2000, 5000] as const
export const giftCardMin = 50
export const giftCardMax = 10_000

export type GiftCardRecord = {
  id: string
  amount: number
  remaining: number
  code?: string
  codeHash: string
  last4: string
  createdAt: string
  status: 'active' | 'spent' | 'transferred'
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

export const shopVouchers: ShopVoucher[] = [
  { code: 'VELVET10', title: 'Velvet Lane 10%', shop: 'Velvet Lane', slug: 'velvet-lane', detail: 'Apparel court this week', percent: 10, minSpend: 250, tone: 'rose' },
  { code: 'NORTH50', title: 'R50 off Northline', shop: 'Northline Supply', slug: 'northline-supply', detail: 'Outdoor and tools', amount: 50, minSpend: 400, tone: 'teal' },
  { code: 'HARBOR15', title: 'Harbor Home 15%', shop: 'Harbor Home', slug: 'harbor-home', detail: 'Home court weekend', percent: 15, minSpend: 500, tone: 'amber' },
  { code: 'LUMEN30', title: 'R30 Lumen Beauty', shop: 'Lumen Beauty', slug: 'lumen-beauty', detail: 'Skincare and salon', amount: 30, minSpend: 150, tone: 'violet' },
  { code: 'ATLAS12', title: 'Atlas Sport 12%', shop: 'Atlas Sport', slug: 'atlas-sport', detail: 'Training kit', percent: 12, minSpend: 300, tone: 'navy' },
]

type WalletState = {
  cards: GiftCardRecord[]
  vouchers: string[]
  sessionCodes: Record<string, string>
  fails: number
  lockedUntil: number
  issueGiftCard: (amount: number) => IssuedGiftCard
  saveVoucher: (code: string) => void
  redeemGiftCard: (code: string, spend: number) => { used: number; remaining: number }
  peekGiftCard: (code: string) => GiftCardRecord
  createShareToken: (cardId: string) => string
  claimSharedCard: (token: string) => GiftCardRecord
  sessionGiftCode: (id: string) => string | null
}

function randomCode() {
  const hex = nanoid(16).replace(/[^a-zA-Z0-9]/g, 'A').toUpperCase().padEnd(16, '0')
  return `MM-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`
}

function hashValue(value: string) {
  let hash = 5381
  for (let i = 0; i < value.length; i += 1) hash = (hash * 33) ^ value.charCodeAt(i)
  return `${(hash >>> 0).toString(16)}${value.length.toString(16)}`
}

export function clampGiftAmount(value: number) {
  if (!Number.isFinite(value)) return giftCardMin
  return Math.min(giftCardMax, Math.max(giftCardMin, Math.round(value)))
}

export function voucherDiscount(code: string, subtotal: number) {
  const voucher = shopVouchers.find((item) => item.code === code)
  if (!voucher || subtotal < voucher.minSpend) return 0
  if (voucher.percent) return Math.round((subtotal * voucher.percent) / 100)
  return voucher.amount ?? 0
}

function lockOrThrow(state: Pick<WalletState, 'fails' | 'lockedUntil'>) {
  if (Date.now() < state.lockedUntil) {
    throw new Error('Too many tries. Wait a few minutes and try again.')
  }
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      cards: [],
      vouchers: [],
      sessionCodes: {},
      fails: 0,
      lockedUntil: 0,
      issueGiftCard: (amount) => {
        const value = clampGiftAmount(amount)
        const code = randomCode()
        const card: GiftCardRecord = {
          id: nanoid(),
          amount: value,
          remaining: value,
          codeHash: hashValue(code),
          last4: code.slice(-4),
          createdAt: new Date().toISOString(),
          status: 'active',
        }
        set({
          cards: [...get().cards, card],
          sessionCodes: { ...get().sessionCodes, [card.id]: code },
        })
        return { ...card, code }
      },
      saveVoucher: (code) => {
        if (get().vouchers.includes(code)) return
        set({ vouchers: [...get().vouchers, code] })
      },
      sessionGiftCode: (id) => get().sessionCodes[id] ?? null,
      peekGiftCard: (code) => {
        const state = get()
        lockOrThrow(state)
        const hash = hashValue(code.trim().toUpperCase())
        const card = state.cards.find(
          (row) =>
            row.status === 'active' &&
            row.remaining > 0 &&
            (row.codeHash === hash || row.code?.toUpperCase() === code.trim().toUpperCase()),
        )
        if (!card) {
          const fails = state.fails + 1
          set({
            fails: fails >= 5 ? 0 : fails,
            lockedUntil: fails >= 5 ? Date.now() + 15 * 60 * 1000 : state.lockedUntil,
          })
          throw new Error('That code is not valid.')
        }
        set({ fails: 0 })
        return card
      },
      redeemGiftCard: (code, spend) => {
        const card = get().peekGiftCard(code)
        const used = Math.min(card.remaining, Math.max(0, spend))
        const remaining = Math.round((card.remaining - used) * 100) / 100
        set({
          cards: get().cards.map((row) =>
            row.id === card.id
              ? { ...row, remaining, status: remaining <= 0 ? 'spent' : 'active' }
              : row,
          ),
        })
        return { used, remaining }
      },
      createShareToken: (cardId) => {
        const card = get().cards.find((row) => row.id === cardId && row.status === 'active')
        if (!card) throw new Error('Card not found.')
        const token = nanoid(24)
        set({
          cards: get().cards.map((row) =>
            row.id === cardId
              ? {
                  ...row,
                  claimHash: hashValue(token),
                  claimExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
                }
              : row,
          ),
        })
        return token
      },
      claimSharedCard: (token) => {
        const hash = hashValue(token)
        const card = get().cards.find(
          (row) =>
            row.claimHash === hash &&
            row.status === 'active' &&
            (row.claimExpiresAt ?? 0) > Date.now(),
        )
        if (!card) throw new Error('This share link is invalid or has expired.')
        const next: GiftCardRecord = {
          ...card,
          id: nanoid(),
          status: 'active',
          createdAt: new Date().toISOString(),
          claimHash: undefined,
          claimExpiresAt: undefined,
          code: undefined,
        }
        set({
          cards: [
            ...get().cards.map((row) =>
              row.id === card.id
                ? { ...row, status: 'transferred' as const, claimHash: undefined, claimExpiresAt: undefined }
                : row,
            ),
            next,
          ],
        })
        return next
      },
    }),
    {
      name: 'mmall-wallet',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cards: state.cards,
        vouchers: state.vouchers,
        sessionCodes: state.sessionCodes,
        fails: state.fails,
        lockedUntil: state.lockedUntil,
      }),
    },
  ),
)
