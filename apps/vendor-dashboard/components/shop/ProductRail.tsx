'use client'

import Link from 'next/link'
import type { Product } from '@shopping-mall/shared-types'
import { money } from './GuestChrome'
import { RailScroller } from './RailScroller'
import { useShopperArea } from '../../lib/useShopperArea'
import { useShopFilter } from '../../lib/ShopFilterProvider'
import { applyShopFilter, withShopFilter } from '../../lib/shopFilters'
import { LoveButton } from './LoveButton'

export function ProductRail({
  title,
  products,
  href,
  loading,
}: {
  title: string
  products: Product[]
  href: string
  loading?: boolean
}) {
  const area = useShopperArea()
  const { filter } = useShopFilter()
  const items = applyShopFilter(products, filter, area)

  if (!loading && items.length === 0) return null

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href={withShopFilter(href, filter)} className="text-sm font-semibold text-glow">
          See all
        </Link>
      </div>
      {loading ? (
        <p className="text-mute">Loading catalog…</p>
      ) : (
        <RailScroller>
          {items.map((product) => (
            <Link
              key={product.id}
              href={`/shop/product/${product.id}`}
              className="mm-listing relative w-48 shrink-0"
            >
              <div className="relative">
                <div
                  className="mm-listing-photo h-40 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : undefined }}
                />
                <LoveButton
                  productId={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.images?.[0]}
                />
              </div>
              <div className="pt-2.5">
                <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
                <p className="mt-1 truncate text-xs text-mute">{product.vendor?.storeName ?? 'MMall'}</p>
                <p className="mt-1.5 text-sm text-glow">{money(product.price)}</p>
              </div>
            </Link>
          ))}
        </RailScroller>
      )}
    </section>
  )
}
