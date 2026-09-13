'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@shopping-mall/shared-types'
import { addGuestBagItem } from '../../lib/guestBag'

export function ProductBuyBox({ product }: { product: Product }) {
  const router = useRouter()
  const options = product.options ?? []
  const [selected, setSelected] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  const ready = useMemo(
    () => options.every((option) => Boolean(selected[option.name])),
    [options, selected],
  )

  function add(thenBuy = false) {
    if (options.length && !ready) {
      setMessage('Choose the available options first.')
      return
    }
    addGuestBagItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity,
      options: selected,
    })
    if (thenBuy) {
      router.push('/shop/checkout')
      return
    }
    setMessage('Added to basket.')
  }

  return (
    <div className="mt-6 space-y-5">
      {options.map((option) => (
        <div key={option.name}>
          <p className="mb-2 text-sm font-semibold">{option.name}</p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const active = selected[option.name] === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelected((current) => ({ ...current, [option.name]: value }))}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    active ? 'bg-brand text-white' : 'bg-black/5 text-ice hover:bg-black/10'
                  }`}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div>
        <p className="mb-2 text-sm font-semibold">Quantity</p>
        <select
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="rounded-lg bg-black/5 px-3 py-2 text-sm"
        >
          {Array.from({ length: 8 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => add(false)}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Add to basket
        </button>
        <button
          type="button"
          onClick={() => add(true)}
          className="rounded-full border border-[var(--mm-card-border)] px-5 py-2.5 text-sm font-semibold text-ice hover:bg-black/5"
        >
          Buy now
        </button>
      </div>
      {message ? <p className="text-sm text-mute">{message}</p> : null}
    </div>
  )
}
