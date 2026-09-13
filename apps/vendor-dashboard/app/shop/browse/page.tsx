'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { api } from '../../../lib/api'
import { GuestChrome, money } from '../../../components/shop/GuestChrome'
import { mockProductsFor } from '../../../lib/mockCatalog'
import { useShopperArea } from '../../../lib/useShopperArea'
import { LoveButton } from '../../../components/shop/LoveButton'
import { FilterBar } from '../../../components/shop/FilterBar'
import { useShopFilter } from '../../../lib/ShopFilterProvider'
import { applyShopFilter } from '../../../lib/shopFilters'

function BrowseGrid() {
  const params = useSearchParams()
  const q = params.get('q') ?? undefined
  const area = useShopperArea()
  const { filter } = useShopFilter()
  const category = filter.category || undefined
  const products = useQuery({
    queryKey: ['guest-browse', category, q],
    queryFn: () => api.products.list({ page: 1, limit: 48, category, q }),
  })
  const needle = q?.trim().toLowerCase()
  const matched = [...(products.data?.items ?? []), ...mockProductsFor(category ?? 'Featured', 16)].filter((product) =>
    !needle
      ? true
      : [product.name, product.description, product.category, product.vendor?.storeName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle)),
  )
  const items = applyShopFilter(matched, filter, area)

  return (
    <GuestChrome>
      <h1 className="mb-4 text-3xl font-semibold">{q ? `Results for “${q}”` : category ?? 'Browse'}</h1>
      <FilterBar />
      {products.isLoading ? <p className="text-mute">Loading…</p> : null}
      <div className="grid grid-cols-4 gap-5">
        {items.map((product) => (
          <Link
            key={product.id}
            href={`/shop/product/${product.id}`}
            className="mm-listing relative"
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
              <p className="font-semibold">{product.name}</p>
              <p className="mt-1.5 text-glow">{money(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </GuestChrome>
  )
}

export default function GuestBrowsePage() {
  return (
    <Suspense fallback={<GuestChrome><p className="text-mute">Loading…</p></GuestChrome>}>
      <BrowseGrid />
    </Suspense>
  )
}
