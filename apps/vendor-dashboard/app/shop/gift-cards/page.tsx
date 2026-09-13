'use client'

import { useEffect, useState } from 'react'
import { GuestChrome, money } from '../../../components/shop/GuestChrome'
import { CourtNav } from '../../../components/shop/CourtNav'
import { GiftCardFace, giftTierFor } from '../../../components/shop/GiftCardFace'
import {
  clampGiftAmount,
  createShareToken,
  giftCardMax,
  giftCardMin,
  giftCardPresets,
  issueGiftCard,
  sessionGiftCode,
  walletBalance,
  walletGiftCards,
  type GiftCardRecord,
  type IssuedGiftCard,
} from '../../../lib/mallWallet'

export default function GiftCardsPage() {
  const [amount, setAmount] = useState<(typeof giftCardPresets)[number] | 'custom'>(500)
  const [custom, setCustom] = useState('750')
  const [cards, setCards] = useState<GiftCardRecord[]>([])
  const [issued, setIssued] = useState<IssuedGiftCard | null>(null)
  const [open, setOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const sync = () => setCards(walletGiftCards())
    sync()
    window.addEventListener('mmall-wallet', sync)
    return () => window.removeEventListener('mmall-wallet', sync)
  }, [])

  const isCustom = amount === 'custom'
  const value = isCustom ? clampGiftAmount(Number(custom)) : amount
  const previewAmount = issued?.amount ?? value
  const previewCustom = issued ? !giftCardPresets.includes(issued.amount as (typeof giftCardPresets)[number]) : isCustom
  const tier = giftTierFor(previewAmount, previewCustom)

  async function buy() {
    setMessage('')
    setShareUrl('')
    const card = await issueGiftCard(value)
    setIssued(card)
    setCards(walletGiftCards())
    setOpen(true)
  }

  async function share(card: GiftCardRecord) {
    setMessage('')
    const token = await createShareToken(card.id)
    const url = `${window.location.origin}/shop/gift-cards/claim?t=${encodeURIComponent(token)}`
    setShareUrl(url)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MMall gift card',
          text: `Someone sent you an MMall gift card worth ${money(card.remaining)}. Use it at any shop.`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setMessage('Share link copied. The PIN is not in the link.')
      }
    } catch {
      setMessage('Share link ready below. The PIN is not in the link.')
    }
  }

  function pick(next: (typeof giftCardPresets)[number] | 'custom') {
    setAmount(next)
    setIssued(null)
    setOpen(true)
  }

  return (
    <GuestChrome>
      <CourtNav />
      <h1 className="text-3xl font-semibold">MMall gift cards</h1>
      <p className="mt-2 max-w-3xl text-mute">
        Each amount is its own voucher. Click a card to render it, then purchase. Spendable at any shop on the mall.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-5">
        {giftCardPresets.map((preset) => (
          <button key={preset} type="button" onClick={() => pick(preset)} className="text-left">
            <GiftCardFace amount={preset} badge={giftTierFor(preset).name} />
          </button>
        ))}
        <button type="button" onClick={() => pick('custom')} className="text-left">
          <GiftCardFace
            amount={clampGiftAmount(Number(custom))}
            custom
            badge="Any amount"
          />
        </button>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Your wallet</h2>
        <p className="mt-1 text-sm text-mute">Balance {money(walletBalance())}</p>
        {cards.length === 0 ? (
          <p className="mt-4 text-mute">No cards yet. Click a voucher above to render and buy it.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-3 gap-5">
            {cards.map((card) => {
              const customCard = !giftCardPresets.includes(card.amount as (typeof giftCardPresets)[number])
              return (
                <li key={card.id}>
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      const code = sessionGiftCode(card.id)
                      setIssued(code ? { ...card, code } : null)
                      setAmount(customCard ? 'custom' : (card.amount as (typeof giftCardPresets)[number]))
                      if (customCard) setCustom(String(card.amount))
                      setOpen(true)
                    }}
                  >
                    <GiftCardFace
                      amount={card.amount}
                      custom={customCard}
                      remaining={card.remaining}
                      badge={giftTierFor(card.amount, customCard).name}
                      code={sessionGiftCode(card.id) ?? `•••• ${card.last4}`}
                    />
                  </button>
                  <button type="button" onClick={() => void share(card)} className="mt-2 text-sm font-semibold text-glow">
                    Share this card
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {shareUrl ? (
          <p className="mt-4 break-all text-sm text-mute">
            Claim link: <span className="text-ice">{shareUrl}</span>
          </p>
        ) : null}
        {message ? <p className="mt-3 text-sm text-mute">{message}</p> : null}
      </section>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close card" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-[min(46rem,92%)]">
            <GiftCardFace
              large
              amount={previewAmount}
              custom={previewCustom}
              remaining={issued?.remaining ?? previewAmount}
              badge={tier.name}
              code={issued?.code}
            />
            <div className="mt-5 rounded-2xl bg-[rgb(var(--mm-navy))] p-5 ring-1 ring-[var(--mm-card-border)]">
              {isCustom && !issued ? (
                <label className="block text-sm">
                  Custom amount
                  <input
                    value={custom}
                    onChange={(event) => setCustom(event.target.value)}
                    inputMode="numeric"
                    className="mt-2 w-40 rounded-full bg-black/5 px-3 py-2 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
                  />
                </label>
              ) : null}
              <p className="mt-2 text-sm text-mute">
                {tier.name}
                {issued
                  ? ` · PIN stored as a hash. After this session you will only see ••••${issued.last4}.`
                  : ` · ${money(giftCardMin)} to ${money(giftCardMax)} · you pay ${money(value)}.`}
              </p>
              <div className="mt-4 flex items-center justify-end gap-4">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-mute">
                  Close
                </button>
                {issued ? (
                  <button
                    type="button"
                    onClick={() => void share(issued)}
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Share card
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void buy()}
                    className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Purchase {tier.name}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </GuestChrome>
  )
}
