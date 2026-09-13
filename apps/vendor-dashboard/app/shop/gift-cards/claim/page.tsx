'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { GuestChrome, money } from '../../../../components/shop/GuestChrome'
import { CourtNav } from '../../../../components/shop/CourtNav'
import { claimSharedCard } from '../../../../lib/mallWallet'

function ClaimForm() {
  const params = useSearchParams()
  const token = params.get('t') ?? ''
  const [done, setDone] = useState<{ last4: string; remaining: number } | null>(null)
  const [error, setError] = useState('')

  async function claim() {
    setError('')
    try {
      const card = await claimSharedCard(token)
      setDone({ last4: card.last4, remaining: card.remaining })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not claim this card.')
    }
  }

  return (
    <>
      <h1 className="text-3xl font-semibold">Claim a gift card</h1>
      <p className="mt-2 max-w-2xl text-mute">
        This link holds a one-time claim token, not the card PIN. Once you claim it, the sender can no longer spend
        it and the balance works at any MMall shop.
      </p>
      {!token ? (
        <p className="mt-6 text-mute">This link is missing its claim token.</p>
      ) : done ? (
        <p className="mt-6 text-ice">
          Added •••• {done.last4} with {money(done.remaining)}.{' '}
          <Link href="/shop/gift-cards" className="text-glow">
            Open wallet
          </Link>
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void claim()}
          className="mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white"
        >
          Add to my wallet
        </button>
      )}
      {error ? <p className="mt-4 text-sm text-mute">{error}</p> : null}
    </>
  )
}

export default function GiftCardClaimPage() {
  return (
    <GuestChrome>
      <CourtNav />
      <Suspense fallback={<p className="text-mute">Loading…</p>}>
        <ClaimForm />
      </Suspense>
    </GuestChrome>
  )
}
