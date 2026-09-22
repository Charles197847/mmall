import Link from 'next/link'

const columns = [
  {
    title: 'The mall',
    links: [
      { href: '/shop', label: 'Home' },
      { href: '/shop/specials', label: "Today's specials" },
      { href: '/shop/bestsellers', label: 'Best sellers' },
      { href: '/shop/gift-cards', label: 'Gift cards' },
      { href: '/shop/vouchers', label: 'Promotional vouchers' },
    ],
  },
  {
    title: 'Sell on MMall',
    links: [
      { href: '/shop/sell', label: 'Open a store' },
      { href: '/login', label: 'Vendor sign in' },
      { href: '/advertise', label: 'Advertise' },
      { href: '/fees', label: 'Fees' },
    ],
  },
  {
    title: 'Orders & help',
    links: [
      { href: '/shop/help#account', label: 'Your account' },
      { href: '/shop/help#orders', label: 'Track an order' },
      { href: '/shop/help#gifts', label: 'Gift card balance' },
      { href: '/shop/help#returns', label: 'Returns' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/shop', label: 'PayGate checkout' },
      { href: '/shop', label: 'Safe & secure' },
      { href: '/shop/legal/shopper', label: 'Shopper Terms' },
      { href: '/shop/legal/vendor', label: 'Vendor Terms' },
      { href: '/shop/legal/privacy', label: 'Privacy Notice' },
      { href: '/verify', label: 'Seller verification' },
    ],
  },
]

export function GuestFooter() {
  return (
    <footer className="mm-shop-footer mt-10">
      <a
        href="#mm-shop-top"
        className="block py-3 text-center text-sm text-mute hover:text-ice"
      >
        Back to top
      </a>
      <div className="mx-auto grid w-[94%] grid-cols-2 gap-8 py-10 sm:gap-10 lg:grid-cols-4">
        {columns.map((column) => (
          <div key={column.title}>
            <p className="text-sm font-semibold">{column.title}</p>
            <ul className="mt-4 space-y-2.5">
              {column.links.map((link) => (
                <li key={`${link.href}-${link.label}`}>
                  <Link href={link.href} className="text-sm text-mute hover:text-ice">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto flex w-[94%] flex-col items-center gap-2 py-8 text-center">
        <p className="text-lg font-bold tracking-tight">M-MALL</p>
        <p className="text-xs text-mute">The digital shopping mall · South Africa · 2027–2035</p>
      </div>
    </footer>
  )
}
