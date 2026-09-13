'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GuestChrome, money } from '../../../components/shop/GuestChrome'
import { readGuestBag, writeGuestBag, type GuestBagItem } from '../../../lib/guestBag'

export default function GuestBagPage() {
  const [items, setItems] = useState<GuestBagItem[]>([])

  useEffect(() => {
    const sync = () => setItems(readGuestBag())
    sync()
    window.addEventListener('mmall-bag', sync)
    return () => window.removeEventListener('mmall-bag', sync)
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <GuestChrome>
      <h1 className="text-3xl font-semibold">Basket</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-mute">
          Your basket is empty.{' '}
          <Link href="/shop" className="text-glow">
            Continue shopping
          </Link>
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${JSON.stringify(item.options)}`} className="flex gap-4">
              <div
                className="mm-listing-photo h-20 w-20 shrink-0 rounded-xl bg-cover bg-center"
                style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }}
              />
              <div className="flex-1">
                <Link href={`/shop/product/${item.productId}`} className="font-semibold">
                  {item.name}
                </Link>
                {Object.keys(item.options).length ? (
                  <p className="mt-1 text-xs text-mute">
                    {Object.entries(item.options)
                      .map(([name, value]) => `${name}: ${value}`)
                      .join(' · ')}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-glow">
                  {money(item.price)} × {item.quantity}
                </p>
              </div>
            </div>
          ))}
          <p className="pt-4 text-lg font-semibold">Subtotal {money(total)}</p>
          <Link href="/shop/checkout" className="mt-2 inline-block rounded-full bg-brand px-5 py-2.5 text-white">
            Checkout
          </Link>
          <button
            type="button"
            className="ml-3 text-sm text-mute"
            onClick={() => {
              writeGuestBag([])
              setItems([])
            }}
          >
            Clear basket
          </button>
        </div>
      )}
    </GuestChrome>
  )
}
