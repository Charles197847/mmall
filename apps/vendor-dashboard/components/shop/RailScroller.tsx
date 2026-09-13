'use client'

import { useRef } from 'react'

export function RailScroller({ children }: { children: React.ReactNode }) {
  const scroller = useRef<HTMLDivElement>(null)

  const slide = (direction: -1 | 1) => {
    const node = scroller.current
    if (!node) return
    node.scrollBy({ left: direction * Math.round(node.clientWidth * 0.85), behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous"
        onClick={() => slide(-1)}
        className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--mm-card-border)] bg-navy/90 text-ice shadow-lg"
      >
        ‹
      </button>
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto scroll-smooth px-14 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label="Next"
        onClick={() => slide(1)}
        className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--mm-card-border)] bg-navy/90 text-ice shadow-lg"
      >
        ›
      </button>
    </div>
  )
}
