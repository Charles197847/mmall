'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { api } from '../../../../lib/api'
import { GuestChrome, money } from '../../../../components/shop/GuestChrome'
import { shopProductGridClass } from '../../../../components/shop/ProductGrid'
import { mallCategories } from '../../../../lib/mallCategories'
import { findMockVendor, mockProductsFor } from '../../../../lib/mockCatalog'
import { proximityLabel } from '@shopping-mall/shared-types'
import { useShopperArea } from '../../../../lib/useShopperArea'
import { LoveButton } from '../../../../components/shop/LoveButton'

export default function GuestStorePage() {
  const { slug } = useParams<{ slug: string }>()
  const vendor = useQuery({
    queryKey: ['guest-store', slug],
    queryFn: () => api.vendors.getBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  })
  const products = useQuery({
    queryKey: ['guest-store-products', slug],
    queryFn: () => api.products.list({ page: 1, limit: 48 }),
  })

  const area = useShopperArea()
  const shop = vendor.data ?? (slug ? findMockVendor(slug) : null)
  const items = [
    ...(products.data?.items ?? []),
    ...mallCategories.flatMap((category) => mockProductsFor(category.name, 14)),
  ].filter((item, index, list) => item.vendor?.slug === slug && list.findIndex((row) => row.id === item.id) === index)

  return (
    <GuestChrome>
      <h1 className="text-3xl font-semibold">{shop?.storeName ?? 'Store'}</h1>
      <p className="mt-2 text-sm text-glow">
        {proximityLabel(area, shop?.city, shop?.lat, shop?.lng) ?? shop?.city ?? 'South Africa'}
      </p>
      <p className="mt-2 max-w-2xl text-mute">{shop?.description}</p>
      <div className={`mt-8 ${shopProductGridClass}`}>
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
