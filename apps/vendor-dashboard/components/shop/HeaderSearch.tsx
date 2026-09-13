'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

function SearchField() {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')

  return (
    <form
      className="relative min-w-[10rem] flex-1"
      onSubmit={(event) => {
        event.preventDefault()
        const value = query.trim()
        router.push(value ? `/shop/browse?q=${encodeURIComponent(value)}` : '/shop/browse')
      }}
    >
      <label className="sr-only" htmlFor="mm-header-search">
        Search MMall
      </label>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </span>
      <input
        id="mm-header-search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search the mall"
        className="w-full rounded-full bg-black/5 py-3.5 pl-11 pr-4 text-sm outline-none ring-1 ring-[var(--mm-card-border)] focus:ring-2 focus:ring-glow"
      />
    </form>
  )
}

export function HeaderSearch() {
  return (
    <Suspense fallback={<div className="min-w-[10rem] flex-1 rounded-full bg-black/5 py-2.5 text-sm text-mute" />}>
      <SearchField />
    </Suspense>
  )
}
