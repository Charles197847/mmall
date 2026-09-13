'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { GuestChrome } from '../../components/shop/GuestChrome'
import { ProductRail } from '../../components/shop/ProductRail'
import { StoreRail } from '../../components/shop/StoreRail'
import { AdBand } from '../../components/shop/AdBand'
import { FilterBar } from '../../components/shop/FilterBar'
import { CourtNav } from '../../components/shop/CourtNav'
import { mallCategories } from '../../lib/mallCategories'
import { mockFeatured, mockProductsFor, mockVendors } from '../../lib/mockCatalog'
import { useShopFilter } from '../../lib/ShopFilterProvider'

export default function GuestHomePage() {
  const live = useQuery({
    queryKey: ['guest-featured'],
    queryFn: () => api.products.list({ page: 1, limit: 24 }),
    staleTime: 60_000,
  })
  const vendors = useQuery({
    queryKey: ['guest-vendors'],
    queryFn: () => api.vendors.list(),
    staleTime: 60_000,
  })

  const { filter } = useShopFilter()
  const featured = [...(live.data?.items ?? []), ...mockFeatured()].slice(0, 18)
  const shops = [...(vendors.data ?? []), ...mockVendors()].filter(
    (shop, index, list) => list.findIndex((item) => item.slug === shop.slug) === index,
  )
  const visibleCategories = filter.category
    ? mallCategories.filter((item) => item.name === filter.category)
    : mallCategories

  return (
    <GuestChrome>
      <CourtNav />

      <StoreRail vendors={shops} />

      <FilterBar />

      <ProductRail title="Featured" products={featured} href="/shop/browse" />

      {visibleCategories.map((category, index) => (
        <div key={category.name}>
          <ProductRail
            title={category.name}
            products={mockProductsFor(category.name, 14)}
            href={`/shop/browse?category=${encodeURIComponent(category.name)}`}
          />
          {(index + 1) % 2 === 0 ? <AdBand label={`${category.name} promo`} /> : null}
        </div>
      ))}
    </GuestChrome>
  )
}
