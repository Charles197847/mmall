'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { GuestChrome, money } from '../../../components/shop/GuestChrome'
import { CourtNav } from '../../../components/shop/CourtNav'
import { useAuthStore } from '../../../stores/authStore'
import { api } from '../../../lib/api'
import { savedVoucherCodes, shopVouchers, walletBalance, walletGiftCards } from '../../../lib/mallWallet'

const sections = [
  { id: 'orders', label: 'Orders' },
  { id: 'returns', label: 'Returns and refunds' },
  { id: 'account', label: 'Your account' },
  { id: 'contact', label: 'Contact us' },
  { id: 'gifts', label: 'Gift card balance' },
  { id: 'vouchers', label: 'Vouchers earned' },
] as const

export default function HelpPage() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const [balance, setBalance] = useState(0)
  const [cards, setCards] = useState(0)
  const [vouchers, setVouchers] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  const orders = useQuery({
    queryKey: ['shop-help-orders'],
    queryFn: () => api.orders.list(),
    enabled: Boolean(token),
    retry: false,
  })

  useEffect(() => {
    const sync = () => {
      setBalance(walletBalance())
      setCards(walletGiftCards().length)
      setVouchers(savedVoucherCodes())
    }
    sync()
    window.addEventListener('mmall-wallet', sync)
    return () => window.removeEventListener('mmall-wallet', sync)
  }, [])

  return (
    <GuestChrome>
      <CourtNav />
      <h1 className="text-3xl font-semibold">Customer service</h1>
      <p className="mt-2 text-mute">Orders, returns, your account, gift cards, and vouchers — one desk for the mall.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-[var(--mm-card-border)] bg-panel px-3 py-1.5 text-xs text-ice hover:border-glow/50"
          >
            {section.label}
          </a>
        ))}
      </div>

      <section id="orders" className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-semibold">Orders</h2>
        {!token ? (
          <p className="mt-2 text-mute">
            <Link href="/shop/login?next=/shop/help" className="text-glow">
              Sign in
            </Link>{' '}
            to see orders placed on the mall.
          </p>
        ) : orders.isError ? (
          <p className="mt-2 text-mute">No live orders on this account yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {(orders.data ?? []).map((order) => (
              <li key={order.id} className="rounded-xl bg-black/5 px-4 py-3 text-sm">
                <span className="font-semibold">{order.id}</span>
                <span className="ml-3 text-mute">{order.status}</span>
              </li>
            ))}
            {orders.data && orders.data.length === 0 ? <li className="text-mute">You have no orders yet.</li> : null}
          </ul>
        )}
      </section>

      <section id="returns" className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-semibold">Returns and refunds</h2>
        <p className="mt-2 max-w-2xl text-mute">
          Start a return from the order once it is delivered. Refunds go back to the original PayGate method, or back
          onto an MMall gift card if you paid that way.
        </p>
      </section>

      <section id="account" className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-semibold">Your account</h2>
        {user ? (
          <p className="mt-2 text-mute">
            Signed in as {user.firstName} {user.lastName} · {user.email}
          </p>
        ) : (
          <p className="mt-2 text-mute">
            <Link href="/shop/login?next=/shop/help#account" className="text-glow">
              Sign in
            </Link>{' '}
            to manage your name, email, and Deliver to address.
          </p>
        )}
      </section>

      <section id="contact" className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-semibold">Contact us</h2>
        <p className="mt-2 text-mute">Mall desk · weekdays 8:00–17:00 SAST · 0860 MMALL 00</p>
        <form
          className="mt-4 max-w-xl space-y-3"
          onSubmit={(event) => {
            event.preventDefault()
            setSent(true)
          }}
        >
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="How can we help?"
            className="h-28 w-full rounded-xl bg-black/5 px-3 py-2 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
          />
          <button type="submit" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">
            Send
          </button>
          {sent ? <p className="text-sm text-mute">Saved. A desk agent will reply to your account email.</p> : null}
        </form>
      </section>

      <section id="gifts" className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-semibold">Gift card balance</h2>
        <p className="mt-2 text-mute">
          {money(balance)} across {cards} card{cards === 1 ? '' : 's'}.{' '}
          <Link href="/shop/gift-cards" className="text-glow">
            Manage cards
          </Link>
        </p>
      </section>

      <section id="vouchers" className="mt-10 scroll-mt-28">
        <h2 className="text-xl font-semibold">Vouchers earned</h2>
        {vouchers.length === 0 ? (
          <p className="mt-2 text-mute">
            None saved yet.{' '}
            <Link href="/shop/vouchers" className="text-glow">
              See shop vouchers
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {vouchers.map((code) => {
              const voucher = shopVouchers.find((item) => item.code === code)
              return (
                <li key={code} className="rounded-xl bg-black/5 px-4 py-3 text-sm">
                  <span className="font-mono font-semibold">{code}</span>
                  {voucher ? <span className="ml-3 text-mute">{voucher.title}</span> : null}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </GuestChrome>
  )
}
