import { money } from './GuestChrome'
import { giftCardPresets } from '../../lib/mallWallet'

export type GiftScene = 'sky' | 'trees' | 'frost' | 'sunburst' | 'aurora' | 'facets' | 'night' | 'sunset'

export type GiftTier = {
  name: string
  scene: GiftScene
  ink: 'light' | 'dark'
  wash: string
}

export const giftTiers: Record<(typeof giftCardPresets)[number] | 'custom', GiftTier> = {
  100: { name: 'Blue voucher', scene: 'sky', ink: 'light', wash: 'from-[#7dd3fc] via-[#38bdf8] to-[#1d4ed8]' },
  200: { name: 'Green voucher', scene: 'trees', ink: 'light', wash: 'from-[#86efac] via-[#16a34a] to-[#14532d]' },
  300: { name: 'Silver voucher', scene: 'frost', ink: 'dark', wash: 'from-[#f8fafc] via-[#cbd5e1] to-[#64748b]' },
  500: { name: 'Gold voucher', scene: 'sunburst', ink: 'dark', wash: 'from-[#fde68a] via-[#f59e0b] to-[#92400e]' },
  1000: { name: 'Platinum voucher', scene: 'aurora', ink: 'dark', wash: 'from-[#f1f5f9] via-[#e2e8f0] to-[#94a3b8]' },
  2000: { name: 'Diamond voucher', scene: 'facets', ink: 'dark', wash: 'from-[#ecfeff] via-[#67e8f9] to-[#0369a1]' },
  5000: { name: 'Black voucher', scene: 'night', ink: 'light', wash: 'from-[#262626] via-[#171717] to-[#000000]' },
  custom: { name: 'Horizon voucher', scene: 'sunset', ink: 'light', wash: 'from-[#fb7185] via-[#f97316] to-[#6d28d9]' },
}

export function giftTierFor(amount: number, custom = false): GiftTier {
  if (custom) return giftTiers.custom
  return giftTiers[amount as (typeof giftCardPresets)[number]] ?? giftTiers.custom
}

function Scene({ scene }: { scene: GiftScene }) {
  if (scene === 'sky') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <circle cx="70" cy="48" r="28" fill="#fff7b0" opacity="0.9" />
        <ellipse cx="90" cy="88" rx="46" ry="16" fill="white" opacity="0.92" />
        <ellipse cx="118" cy="82" rx="28" ry="14" fill="white" opacity="0.88" />
        <ellipse cx="250" cy="70" rx="58" ry="18" fill="white" opacity="0.85" />
        <ellipse cx="290" cy="64" rx="32" ry="14" fill="white" opacity="0.8" />
        <ellipse cx="340" cy="150" rx="70" ry="20" fill="white" opacity="0.55" />
        <ellipse cx="40" cy="160" rx="50" ry="16" fill="white" opacity="0.45" />
      </svg>
    )
  }
  if (scene === 'trees') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <ellipse cx="200" cy="230" rx="220" ry="40" fill="#166534" />
        <path d="M40 210 L70 110 L100 210 Z" fill="#14532d" />
        <path d="M90 210 L130 80 L170 210 Z" fill="#166534" />
        <path d="M160 210 L210 60 L260 210 Z" fill="#15803d" />
        <path d="M240 210 L290 95 L340 210 Z" fill="#14532d" />
        <path d="M300 210 L350 120 L390 210 Z" fill="#166534" />
        <rect x="66" y="200" width="8" height="18" fill="#3f2a14" />
        <rect x="124" y="198" width="10" height="20" fill="#3f2a14" />
        <rect x="204" y="196" width="12" height="22" fill="#3f2a14" />
        <rect x="284" y="198" width="10" height="20" fill="#3f2a14" />
      </svg>
    )
  }
  if (scene === 'frost') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g stroke="#334155" strokeWidth="1.2" fill="none" opacity="0.35">
          <path d="M40 40 L70 70 L40 100 M70 70 H110" />
          <path d="M300 30 L330 60 L300 90 M330 60 H370" />
          <path d="M180 20 L200 50 L180 80 M200 50 H240" />
          <path d="M90 150 L120 180 L90 210 M120 180 H160" />
          <path d="M310 140 L340 170 L310 200 M340 170 H380" />
        </g>
        <circle cx="320" cy="50" r="3" fill="#334155" opacity="0.4" />
        <circle cx="60" cy="170" r="2" fill="#334155" opacity="0.4" />
        <circle cx="210" cy="90" r="2.5" fill="#334155" opacity="0.35" />
      </svg>
    )
  }
  if (scene === 'sunburst') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g fill="#fde68a" opacity="0.35">
          {Array.from({ length: 16 }, (_, index) => (
            <path
              key={index}
              d={`M200 120 L${200 + Math.cos((index / 16) * Math.PI * 2) * 220} ${120 + Math.sin((index / 16) * Math.PI * 2) * 160} L${200 + Math.cos(((index + 0.4) / 16) * Math.PI * 2) * 220} ${120 + Math.sin(((index + 0.4) / 16) * Math.PI * 2) * 160} Z`}
            />
          ))}
        </g>
        <circle cx="200" cy="120" r="36" fill="#fef3c7" opacity="0.7" />
      </svg>
    )
  }
  if (scene === 'aurora') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <path d="M0 80 C80 20 140 140 220 70 C300 10 340 110 400 50 V0 H0 Z" fill="#99f6e4" opacity="0.45" />
        <path d="M0 120 C90 60 160 160 250 90 C320 40 360 130 400 90 V240 H0 Z" fill="#a5b4fc" opacity="0.28" />
      </svg>
    )
  }
  if (scene === 'facets') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <polygon points="200,20 260,90 200,120 140,90" fill="white" opacity="0.45" />
        <polygon points="260,90 340,80 300,150 200,120" fill="#e0f2fe" opacity="0.4" />
        <polygon points="140,90 200,120 100,150 60,80" fill="#bae6fd" opacity="0.4" />
        <polygon points="200,120 300,150 200,220 100,150" fill="white" opacity="0.25" />
        <polygon points="80,30 140,90 40,100" fill="white" opacity="0.3" />
        <polygon points="320,30 360,90 260,90" fill="#f0f9ff" opacity="0.35" />
      </svg>
    )
  }
  if (scene === 'night') {
    return (
      <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g fill="#fbbf24" opacity="0.55">
          <circle cx="40" cy="36" r="1.4" />
          <circle cx="90" cy="22" r="1.1" />
          <circle cx="140" cy="48" r="1.3" />
          <circle cx="210" cy="18" r="1.2" />
          <circle cx="280" cy="40" r="1.5" />
          <circle cx="340" cy="28" r="1.1" />
          <circle cx="370" cy="70" r="1.3" />
          <circle cx="60" cy="90" r="1" />
          <circle cx="180" cy="70" r="1.2" />
        </g>
        <path d="M0 200 L400 160" stroke="#fbbf24" strokeWidth="0.6" opacity="0.25" />
        <path d="M0 220 L400 180" stroke="#fbbf24" strokeWidth="0.4" opacity="0.15" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 400 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <circle cx="300" cy="70" r="34" fill="#fde68a" opacity="0.85" />
      <path d="M0 150 C80 120 160 180 240 140 C300 110 350 150 400 130 V240 H0 Z" fill="#9a3412" opacity="0.35" />
      <path d="M0 180 C100 160 180 200 280 170 C340 150 370 180 400 170 V240 H0 Z" fill="#1e1b4b" opacity="0.35" />
    </svg>
  )
}

export function GiftCardFace({
  amount,
  custom = false,
  badge,
  code,
  remaining,
  large = false,
}: {
  amount: number
  custom?: boolean
  badge?: string
  code?: string
  remaining?: number
  large?: boolean
}) {
  const tier = giftTierFor(amount, custom)
  const dark = tier.ink === 'dark'

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tier.wash} shadow-xl ${
        large ? 'aspect-[1.7/1] p-8' : 'aspect-[1.65/1] p-5'
      } ${dark ? 'text-slate-900' : 'text-white'}`}
    >
      <Scene scene={tier.scene} />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/mmall-bag.png" alt="" className={large ? 'h-14 w-auto' : 'h-10 w-auto'} />
            <img
              src="/mmall-wordmark.png"
              alt="M-MALL"
              className={`${large ? 'h-8' : 'h-6'} w-auto ${dark ? '' : 'brightness-0 invert'}`}
            />
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
              dark ? 'bg-black/15' : 'bg-white/20'
            }`}
          >
            {badge ?? money(amount)}
          </span>
        </div>
        <div>
          <p className={`uppercase tracking-[0.2em] ${dark ? 'text-slate-700' : 'text-white/75'} ${large ? 'text-sm' : 'text-xs'}`}>
            {tier.name}
          </p>
          <p className={`font-semibold ${large ? 'mt-1 text-4xl' : 'mt-0.5 text-2xl'}`}>
            {money(remaining ?? amount)}
          </p>
          <p className={`mt-1 ${dark ? 'text-slate-700' : 'text-white/80'} ${large ? 'text-base' : 'text-sm'}`}>
            Valid at every MMall shop
          </p>
          {code ? (
            <p className={`mt-3 font-mono tracking-wider ${large ? 'text-xl' : 'text-sm'}`}>{code}</p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
