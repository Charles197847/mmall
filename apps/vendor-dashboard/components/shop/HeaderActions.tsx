'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { bagCount, readGuestBag } from '../../lib/guestBag'
import { loveCount, readGuestLove } from '../../lib/guestLove'

function Badge({ count }: { count: number }) {
  if (count < 1) return null
  return (
    <span className="absolute -right-2 -top-1.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[#ff2d4a] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-[rgb(var(--mm-navy))]">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function HeaderActions() {
  const [loved, setLoved] = useState(0)
  const [bag, setBag] = useState(0)

  useEffect(() => {
    const sync = () => {
      setLoved(loveCount(readGuestLove()))
      setBag(bagCount(readGuestBag()))
    }
    sync()
    window.addEventListener('mmall-love', sync)
    window.addEventListener('mmall-bag', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('mmall-love', sync)
      window.removeEventListener('mmall-bag', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return (
    <div className="flex items-center gap-2 sm:gap-5">
      <Link href="/shop/saved" className="relative p-1 text-ice hover:text-glow" aria-label={`Loved items, ${loved}`}>
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path
            d="M12 20s-7-4.4-7-9.2C5 8 6.8 6.4 9 6.4c1.3 0 2.4.7 3 1.7.6-1 1.7-1.7 3-1.7 2.2 0 4 1.6 4 4.4 0 4.8-7 9.2-7 9.2Z"
            strokeLinejoin="round"
          />
        </svg>
        <Badge count={loved} />
      </Link>
      <Link href="/shop/bag" className="relative p-1 text-ice hover:text-glow" aria-label={`Basket, ${bag} items`}>
        <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" stroke="currentColor" strokeWidth="1.7">
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M3 4h2l2.2 11h11.3l1.8-7H7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Badge count={bag} />
      </Link>
    </div>
  )
}
