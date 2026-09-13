'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GuestChrome, money } from '../../../components/shop/GuestChrome'
import { readGuestLove, writeGuestLove, type GuestLoveItem } from '../../../lib/guestLove'
import { LoveButton } from '../../../components/shop/LoveButton'

export default function GuestSavedPage() {
  const [items, setItems] = useState<GuestLoveItem[]>([])

  useEffect(() => {
    const sync = () => setItems(readGuestLove())
    sync()
    window.addEventListener('mmall-love', sync)
    return () => window.removeEventListener('mmall-love', sync)
  }, [])

  return (
    <GuestChrome>
      <h1 className="text-3xl font-semibold">Loved</h1>
      {items.length === 0 ? (
        <p className="mt-4 text-mute">
          Nothing saved yet.{' '}
          <Link href="/shop" className="text-glow">
            Browse the mall
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-4 gap-5">
          {items.map((item) => (
            <div key={item.productId} className="mm-listing relative">
              <Link href={`/shop/product/${item.productId}`}>
                <div className="relative">
                  <div
                    className="mm-listing-photo h-40 rounded-xl bg-cover bg-center"
                    style={{ backgroundImage: item.image ? `url(${item.image})` : undefined }}
                  />
                  <LoveButton
                    productId={item.productId}
                    name={item.name}
                    price={item.price}
                    image={item.image}
                  />
                </div>
                <p className="mt-2.5 font-semibold">{item.name}</p>
                <p className="mt-1 text-glow">{money(item.price)}</p>
              </Link>
              <button
                type="button"
                className="mt-2 text-sm text-mute"
                onClick={() => {
                  const next = items.filter((row) => row.productId !== item.productId)
                  writeGuestLove(next)
                  setItems(next)
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </GuestChrome>
  )
}
