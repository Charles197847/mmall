'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BrandLockup } from '../brand/BrandLockup'

const links = [
  { href: '/', label: 'Overview' },
  { href: '/products', label: 'Products' },
  { href: '/orders', label: 'Orders' },
  { href: '/studio', label: 'AI Studio' },
  { href: '/advertise', label: 'Advertise' },
  { href: '/store/settings', label: 'Store settings' },
  { href: '/fees', label: 'Pricing & fees' },
  { href: '/verify', label: 'Verify account' },
]

export function Sidebar({ storeName }: { storeName?: string }) {
  const pathname = usePathname()
  return (
    <aside className="relative w-64 text-ice p-5">
      <span className="pointer-events-none absolute top-10 bottom-10 right-0 w-px bg-gradient-to-b from-transparent via-glow/50 to-transparent" />
      <BrandLockup subtitle="VENDOR NODE" />
      <p className="text-sm text-mute mb-4 truncate">{storeName || 'Your store'}</p>
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
