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

export function Sidebar({
  storeName,
  open,
  onNavigate,
}: {
  storeName?: string
  open: boolean
  onNavigate: () => void
}) {
  const pathname = usePathname()
  return (
    <aside
      id="desk-nav"
      className={`relative w-64 shrink-0 bg-void p-5 text-ice lg:bg-transparent ${
        open ? 'fixed inset-y-0 left-0 z-40 block overflow-y-auto' : 'hidden'
      } lg:static lg:z-auto lg:block`}
    >
      <span className="pointer-events-none absolute top-10 bottom-10 right-0 w-px bg-gradient-to-b from-transparent via-glow/50 to-transparent" />
      <div className="mb-4 flex items-start justify-between gap-3 lg:block">
        <BrandLockup subtitle="VENDOR NODE" />
        <button type="button" className="text-sm text-mute lg:hidden" onClick={onNavigate}>
          Close
        </button>
      </div>
      <p className="mb-4 truncate text-sm text-mute">{storeName || 'Your store'}</p>
      <nav className="space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
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
