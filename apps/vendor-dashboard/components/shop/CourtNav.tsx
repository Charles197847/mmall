'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const courtLinks = [
  { href: '/shop', label: 'Home', icon: '⌂' },
  { href: '/shop/gift-cards', label: 'Gift cards', icon: '🎁' },
  { href: '/shop/specials', label: "Today's specials", icon: '⚡' },
  { href: '/shop/bestsellers', label: 'Best sellers', icon: '★' },
  { href: '/shop/vouchers', label: 'Promotional vouchers', icon: '🎟' },
  { href: '/shop/help', label: 'Customer service', icon: '☎' },
  { href: '/shop/sell', label: 'Sell', icon: '🏪' },
] as const

export function CourtNav() {
  const pathname = usePathname()

  return (
    <nav className="mb-8" aria-label="Mall pages">
      <div className="flex flex-wrap gap-1.5">
        {courtLinks.map((item) => {
          const active = item.href === '/shop' ? pathname === '/shop' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs ${
                active
                  ? 'border-glow bg-brand text-white'
                  : 'border-[var(--mm-card-border)] bg-panel text-ice hover:border-glow/50'
              }`}
            >
              <span aria-hidden>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
