'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { GuestChrome, money } from '../../../components/shop/GuestChrome'
import { CourtNav } from '../../../components/shop/CourtNav'
import { MallCardFace } from '../../../components/shop/MallCardFace'
import { saveVoucher, savedVoucherCodes, shopVouchers, type ShopVoucher } from '../../../lib/mallWallet'

function offerLabel(voucher: ShopVoucher) {
  return voucher.percent ? `${voucher.percent}% OFF` : `${money(voucher.amount ?? 0)} OFF`
}

export default function VouchersPage() {
  const [saved, setSaved] = useState<string[]>([])
  const [selected, setSelected] = useState<ShopVoucher | null>(null)

  useEffect(() => {
    const sync = () => setSaved(savedVoucherCodes())
    sync()
    window.addEventListener('mmall-wallet', sync)
    return () => window.removeEventListener('mmall-wallet', sync)
  }, [])

  return (
    <GuestChrome>
      <CourtNav />
      <h1 className="text-3xl font-semibold">Promotional vouchers</h1>
      <p className="mt-2 text-mute">Click a card to render it. Save it, then apply the code at checkout.</p>
      <div className="mt-8 grid grid-cols-3 gap-6">
        {shopVouchers.map((voucher) => (
          <button key={voucher.code} type="button" className="text-left" onClick={() => setSelected(voucher)}>
            <MallCardFace
              tone={voucher.tone}
              eyebrow="Promotional voucher"
              title={voucher.shop}
              detail={`${voucher.detail} · Min ${money(voucher.minSpend)}`}
              badge={offerLabel(voucher)}
              code={voucher.code}
            />
          </button>
        ))}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-8">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close card"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 w-[min(42rem,92%)]">
            <MallCardFace
              large
              tone={selected.tone}
              eyebrow="Promotional voucher"
              title={selected.shop}
              detail={`${selected.detail} · Min spend ${money(selected.minSpend)}`}
              badge={offerLabel(selected)}
              code={selected.code}
            />
            <div className="mt-5 flex items-center justify-end gap-4">
              <Link href={`/shop/store/${selected.slug}`} className="text-sm font-semibold text-glow">
                Visit shop
              </Link>
              <button
                type="button"
                disabled={saved.includes(selected.code)}
                onClick={() => saveVoucher(selected.code)}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saved.includes(selected.code) ? 'Saved' : 'Save this card'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </GuestChrome>
  )
}
