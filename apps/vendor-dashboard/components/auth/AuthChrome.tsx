'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '../theme/ThemeToggle'

export function AuthChrome({
  children,
  closeHref = '/shop',
}: {
  children: ReactNode
  closeHref?: string
}) {
  return (
    <div className="flex min-h-screen flex-col bg-grid text-ice">
      <header className="sticky top-0 z-20 bg-navy/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-[94%] items-center justify-between">
          <Link href="/shop" className="flex shrink-0 items-center gap-3" aria-label="MMall home">
            <img src="/mmall-bag.png" alt="" className="h-10 w-auto" />
            <img src="/mmall-wordmark.png" alt="M-MALL" className="mm-wordmark" />
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle variant="icon" />
            <Link
              href={closeHref}
              aria-label="Close and return to the mall"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mm-card-border)] text-ice hover:bg-black/10"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-[94%] flex-1 items-start justify-center py-12">{children}</main>
    </div>
  )
}
