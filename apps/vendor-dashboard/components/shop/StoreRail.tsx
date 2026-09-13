'use client'

import Link from 'next/link'
import type { Vendor } from '@shopping-mall/shared-types'
import { proximityLabel, proximityScore } from '@shopping-mall/shared-types'
import { RailScroller } from './RailScroller'
import { useShopperArea } from '../../lib/useShopperArea'

export function StoreRail({ vendors, loading }: { vendors: Vendor[]; loading?: boolean }) {
  const area = useShopperArea()
  const shops = [...vendors].sort(
    (a, b) =>
      proximityScore(area, a.city, a.lat, a.lng) - proximityScore(area, b.city, b.lat, b.lng),
  )

  if (!loading && shops.length === 0) return null

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Stores</h2>
          <p className="text-sm text-mute">
            {area ? `Nearest to ${area.city} first` : 'Visit a branded shop'}
          </p>
        </div>
        <Link href="/shop/browse" className="text-sm font-semibold text-glow">
          See all
        </Link>
      </div>
      {loading ? (
        <p className="text-mute">Loading stores…</p>
      ) : (
        <RailScroller>
          {shops.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/shop/store/${vendor.slug}`}
              className="mm-listing w-56 shrink-0"
            >
              <div
                className="mm-listing-photo mb-3 h-12 w-12 rounded-full bg-cover bg-center"
                style={{ backgroundImage: vendor.logo ? `url(${vendor.logo})` : undefined }}
              />
              <p className="font-semibold">{vendor.storeName}</p>
              <p className="mt-1 text-xs text-glow">
                {proximityLabel(area, vendor.city, vendor.lat, vendor.lng) ?? 'South Africa'}
              </p>
              <p className="mt-1 line-clamp-2 text-xs text-mute">{vendor.description || 'Independent store'}</p>
            </Link>
          ))}
        </RailScroller>
      )}
    </section>
  )
}
