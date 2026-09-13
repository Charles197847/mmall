import Link from 'next/link'
import { mockAds } from '../../lib/mockCatalog'

export function AdBand({ label }: { label: string }) {
  const items = mockAds(label, 2)

  return (
    <section className="mb-10">
      <p className="mb-3 text-[10px] tracking-[0.2em] text-mute">SPONSORED</p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {items.map((ad) => (
          <Link
            key={ad.id}
            href={ad.vendorSlug ? `/shop/store/${ad.vendorSlug}` : '/shop/browse'}
            className="mm-listing"
          >
            <div
              className="mm-ad-photo h-52 w-full rounded-2xl bg-cover bg-center md:h-64"
              style={{ backgroundImage: ad.imageUrl ? `url(${ad.imageUrl})` : undefined }}
            />
            <div className="pt-3">
              <p className="text-[11px] tracking-[0.22em] text-glow">SPONSORED</p>
              <p className="mt-1.5 text-lg font-semibold">{ad.title}</p>
              {ad.headline ? <p className="mt-1 text-sm text-mute">{ad.headline}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
