'use client'

import { useEffect, useState } from 'react'
import { isLoved, toggleGuestLove } from '../../lib/guestLove'

export function LoveButton({
  productId,
  name,
  price,
  image,
}: {
  productId: string
  name: string
  price: number
  image?: string
}) {
  const [loved, setLoved] = useState(false)

  useEffect(() => {
    const sync = () => setLoved(isLoved(productId))
    sync()
    window.addEventListener('mmall-love', sync)
    return () => window.removeEventListener('mmall-love', sync)
  }, [productId])

  return (
    <button
      type="button"
      aria-label={loved ? 'Remove from loved' : 'Save to loved'}
      aria-pressed={loved}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        toggleGuestLove({ productId, name, price, image })
      }}
      className={`absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-navy/80 ${
        loved ? 'text-[rgb(var(--mm-signal))]' : 'text-ice'
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={loved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7">
        <path
          d="M12 20s-7-4.4-7-9.2C5 8 6.8 6.4 9 6.4c1.3 0 2.4.7 3 1.7.6-1 1.7-1.7 3-1.7 2.2 0 4 1.6 4 4.4 0 4.8-7 9.2-7 9.2Z"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
