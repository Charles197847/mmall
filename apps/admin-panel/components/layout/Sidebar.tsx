'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLockup } from '../brand/BrandLockup'

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/vendors', label: 'Vendors' },
  { href: '/orders', label: 'Orders' },
  { href: '/ads', label: 'Ads & campaigns' },
  { href: '/users', label: 'Users' },
  { href: '/settings', label: 'Pricing & fees' },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="relative w-64 text-ice p-5">
      <span className="pointer-events-none absolute top-10 bottom-10 right-0 w-px bg-gradient-to-b from-transparent via-glow/50 to-transparent" />
      <BrandLockup subtitle="CONTROL PLANE" />
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block rounded-xl px-3 py-2 text-sm ${
              pathname === link.href ? 'bg-brand text-white shadow-glow' : 'text-mute hover:bg-panel hover:text-ice'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
