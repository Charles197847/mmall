'use client'

import Link from 'next/link'

export function TermsAccept({
  role,
  accepted,
  onChange,
}: {
  role: 'shopper' | 'vendor'
  accepted: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-start gap-3 text-sm leading-6 text-mute">
      <input
        type="checkbox"
        checked={accepted}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-[rgb(var(--mm-brand))]"
      />
      <span>
        I agree to the{' '}
        {role === 'shopper' ? (
          <Link href="/shop/legal/shopper" className="font-semibold text-ice hover:text-glow" target="_blank">
            Shopper Terms
          </Link>
        ) : (
          <Link href="/shop/legal/vendor" className="font-semibold text-ice hover:text-glow" target="_blank">
            Vendor Terms
          </Link>
        )}
        {role === 'vendor' ? (
          <>
            {', the '}
            <Link href="/fees" className="font-semibold text-ice hover:text-glow" target="_blank">
              fee schedule
            </Link>
          </>
        ) : null}
        {', and the '}
        <Link href="/shop/legal/privacy" className="font-semibold text-ice hover:text-glow" target="_blank">
          Privacy Notice
        </Link>
        .
      </span>
    </label>
  )
}
