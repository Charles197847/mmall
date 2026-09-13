'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mockAds } from '../../lib/mockCatalog'

const AUTH_PATHS = new Set(['/shop/login', '/shop/signup', '/shop/join', '/shop/sell'])

const FIRST_MS = 8_000
const EVERY_MS = 40_000

export function AdPopup() {
  const pathname = usePathname()
  const ads = mockAds('Popup', 8)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const openRef = useRef(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const show = () => {
      if (openRef.current) return
      openRef.current = true
      setOpen(true)
    }

    let intervalId = 0
    const startId = window.setTimeout(() => {
      show()
      intervalId = window.setInterval(show, EVERY_MS)
    }, FIRST_MS)

    return () => {
      window.clearTimeout(startId)
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open])

  function close() {
    openRef.current = false
    setOpen(false)
    setIndex((current) => (current + 1) % ads.length)
  }

  if (!open || AUTH_PATHS.has(pathname) || pathname.startsWith('/shop/legal')) return null

  const ad = ads[index]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label="Dismiss sponsored ad"
        onClick={close}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mm-ad-popup-title"
        className="relative z-10 w-full max-w-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          className="absolute -top-3 -right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-navy text-lg text-ice shadow-lg"
          aria-label="Close ad"
        >
          ×
        </button>
        <Link
          href={ad.vendorSlug ? `/shop/store/${ad.vendorSlug}` : '/shop/browse'}
          onClick={close}
          className="mm-listing block"
        >
          <div
            className="mm-ad-photo h-56 w-full rounded-2xl bg-cover bg-center md:h-72"
            style={{ backgroundImage: ad.imageUrl ? `url(${ad.imageUrl})` : undefined }}
          />
          <div className="pt-3">
            <p className="text-[11px] tracking-[0.22em] text-glow">SPONSORED</p>
            <p id="mm-ad-popup-title" className="mt-1.5 text-xl font-semibold">
              {ad.title}
            </p>
            {ad.headline ? <p className="mt-1 text-sm text-mute">{ad.headline}</p> : null}
            <p className="mt-3 text-sm font-semibold text-glow">Visit {ad.vendorName ?? 'store'} →</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
