'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import type { Product } from '@shopping-mall/shared-types'
import { api } from '../../../../lib/api'
import { GuestChrome, money } from '../../../../components/shop/GuestChrome'
import { ProductRail } from '../../../../components/shop/ProductRail'
import { ProductBuyBox } from '../../../../components/shop/ProductBuyBox'
import { ShopPromises } from '../../../../components/shop/ShopPromises'
import { LoveButton } from '../../../../components/shop/LoveButton'
import { findMockProduct, reviewsFromApi, withSellerDetail } from '../../../../lib/productDetail'
import { mockProductsFor } from '../../../../lib/mockCatalog'

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value)
  return (
    <span className="text-sm text-glow" aria-label={`${value.toFixed(1)} out of 5`}>
      {'★'.repeat(rounded)}
      {'☆'.repeat(Math.max(0, 5 - rounded))}
    </span>
  )
}

export default function GuestProductPage() {
  const { id } = useParams<{ id: string }>()
  const [photo, setPhoto] = useState(0)

  useEffect(() => {
    setPhoto(0)
  }, [id])

  const live = useQuery({
    queryKey: ['guest-product', id],
    queryFn: () => api.products.get(id),
    enabled: Boolean(id) && !id.startsWith('mock-'),
    retry: false,
  })

  const item = useMemo<Product | null>(() => {
    if (!id) return null
    if (id.startsWith('mock-')) return findMockProduct(id)
    if (live.data) return withSellerDetail(live.data)
    return findMockProduct(id)
  }, [id, live.data])

  const reviews = item ? reviewsFromApi(item) : []
  const topReviews = [...reviews].sort((a, b) => b.rating - a.rating).slice(0, 5)
  const related = item?.category
    ? mockProductsFor(item.category, 12).filter((row) => row.id !== item.id)
    : []

  return (
    <GuestChrome>
      {live.isLoading && !item ? <p className="text-mute">Loading product…</p> : null}
      {!live.isLoading && !item ? <p className="text-mute">This listing is not available.</p> : null}

      {item ? (
        <>
          <p className="mb-4 text-sm text-mute">
            <Link href="/shop" className="hover:text-ice">
              Mall
            </Link>
            {item.category ? (
              <>
                {' / '}
                <Link href={`/shop/browse?category=${encodeURIComponent(item.category)}`} className="hover:text-ice">
                  {item.category}
                </Link>
              </>
            ) : null}
          </p>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <div className="relative">
                <div
                  className="mm-listing-photo min-h-80 rounded-xl bg-cover bg-center md:min-h-[28rem]"
                  style={{ backgroundImage: item.images?.[photo] ? `url(${item.images[photo]})` : undefined }}
                />
                <LoveButton
                  productId={item.id}
                  name={item.name}
                  price={item.price}
                  image={item.images?.[0]}
                />
              </div>
              {item.images.length > 1 ? (
                <div className="mt-3 flex gap-2">
                  {item.images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setPhoto(index)}
                      className={`mm-listing-photo h-16 w-16 rounded-xl bg-cover bg-center ${
                        photo === index ? 'ring-2 ring-glow' : ''
                      }`}
                      style={{ backgroundImage: `url(${image})` }}
                      aria-label={`Photo ${index + 1}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <h1 className="text-3xl font-semibold md:text-4xl">{item.name}</h1>
              {item.vendor ? (
                <Link href={`/shop/store/${item.vendor.slug}`} className="mt-2 inline-block text-sm text-glow">
                  Visit {item.vendor.storeName}
                </Link>
              ) : null}
              {item.rating && item.reviewCount ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-mute">
                  <Stars value={item.rating} />
                  {item.reviewCount} reviews
                </p>
              ) : null}

              <div className="mt-5">
                <p className="text-2xl font-semibold text-glow">{money(item.price)}</p>
                {item.comparePrice ? (
                  <p className="text-sm text-mute line-through">{money(item.comparePrice)}</p>
                ) : null}
              </div>

              <div className="mt-5">
                <ShopPromises compact />
              </div>

              <ProductBuyBox product={item} />
            </div>
          </div>

          {item.description || item.styleNotes || item.fromShop || item.specs?.length ? (
            <section className="mt-14">
              <h2 className="text-xl font-semibold">Product information</h2>
              {item.description ? <p className="mt-3 max-w-3xl text-mute">{item.description}</p> : null}
              {item.styleNotes ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">Style</h3>
                  <p className="mt-2 max-w-3xl text-mute">{item.styleNotes}</p>
                </div>
              ) : null}
              {item.fromShop ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">From the shop</h3>
                  <p className="mt-2 max-w-3xl text-mute">{item.fromShop}</p>
                </div>
              ) : null}
              {item.specs?.length ? (
                <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-3">
                  {item.specs.map((spec) => (
                    <div key={spec.label}>
                      <dt className="text-xs tracking-wide text-mute">{spec.label}</dt>
                      <dd className="mt-1 text-sm">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </section>
          ) : null}

          {related.length ? (
            <div className="mt-14">
              <ProductRail
                title={item.category ? `More in ${item.category}` : 'You may also like'}
                products={related}
                href={
                  item.category
                    ? `/shop/browse?category=${encodeURIComponent(item.category)}`
                    : '/shop/browse'
                }
              />
            </div>
          ) : null}

          {topReviews.length ? (
            <section className="mt-6 mb-8">
              <h2 className="text-xl font-semibold">Top reviews</h2>
              <div className="mt-5 grid grid-cols-2 gap-6">
                {topReviews.map((review) => (
                  <article key={review.id}>
                    <Stars value={review.rating} />
                    {review.title ? <p className="mt-1 font-semibold">{review.title}</p> : null}
                    <p className="mt-2 text-sm text-mute">{review.content}</p>
                    <p className="mt-2 text-xs text-mute">{review.author}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </GuestChrome>
  )
}
