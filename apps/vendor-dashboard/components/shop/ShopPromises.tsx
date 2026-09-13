export const shopPromises = [
  {
    label: 'Shop',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M3 4h2l2.2 11h11.3l1.8-7H7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Discover',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Safe & Secure',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3 5 6v6c0 5 3.2 8.2 7 9 3.8-.8 7-4 7-9V6l-7-3Z" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Delivered to you',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 7h11v10H3z" />
        <path d="M14 10h4l3 3v4h-7" />
        <circle cx="7.5" cy="18.5" r="1.5" />
        <circle cx="17.5" cy="18.5" r="1.5" />
      </svg>
    ),
  },
]

export function ShopPromises({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={compact ? 'flex shrink-0 items-center gap-8' : 'flex shrink-0 items-center gap-5'}>
      {shopPromises.map((item) => (
        <li key={item.label} className="flex items-center gap-2 text-ice">
          <span>{item.icon}</span>
          <span className="text-xs font-medium tracking-wide text-mute">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}
