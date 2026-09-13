import { money } from './GuestChrome'

export const mallCardLooks = {
  navy: 'from-[#1d4ed8] via-[#1e40af] to-[#0b1224]',
  rose: 'from-[#fb7185] via-[#e11d48] to-[#7f1d1d]',
  teal: 'from-[#2dd4bf] via-[#0f766e] to-[#042f2e]',
  amber: 'from-[#fbbf24] via-[#d97706] to-[#7c2d12]',
  violet: 'from-[#c084fc] via-[#7c3aed] to-[#2e1065]',
  ink: 'from-[#38bdf8] via-[#2563eb] to-[#0b1224]',
} as const

export type MallCardTone = keyof typeof mallCardLooks

export function MallCardFace({
  tone,
  eyebrow,
  title,
  detail,
  badge,
  code,
  large = false,
}: {
  tone: MallCardTone
  eyebrow: string
  title: string
  detail?: string
  badge: string
  code?: string
  large?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${mallCardLooks[tone]} text-white shadow-xl ${
        large ? 'p-8' : 'p-5'
      }`}
    >
      <span className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <span className="pointer-events-none absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-black/20" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/mmall-bag.png" alt="" className={large ? 'h-14 w-auto' : 'h-10 w-auto'} />
            <img
              src="/mmall-wordmark.png"
              alt="M-MALL"
              className={`${large ? 'h-8' : 'h-6'} w-auto brightness-0 invert`}
            />
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide">{badge}</span>
        </div>
        <p className={`uppercase tracking-[0.2em] text-white/70 ${large ? 'mt-10 text-sm' : 'mt-6 text-xs'}`}>
          {eyebrow}
        </p>
        <p className={`font-semibold ${large ? 'mt-2 text-4xl' : 'mt-1 text-2xl'}`}>{title}</p>
        {detail ? <p className={`text-white/80 ${large ? 'mt-3 text-base' : 'mt-1 text-sm'}`}>{detail}</p> : null}
        {code ? (
          <>
            <div className="my-4 border-t border-dashed border-white/40" />
            <p className={`font-mono tracking-wider ${large ? 'text-2xl' : 'text-lg'}`}>{code}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}

export function amountTone(amount: number): MallCardTone {
  if (amount >= 5000) return 'violet'
  if (amount >= 2000) return 'amber'
  if (amount >= 1000) return 'rose'
  if (amount >= 500) return 'navy'
  if (amount >= 300) return 'teal'
  return 'ink'
}

export function giftBadge(amount: number) {
  return money(amount)
}
