'use client'

import Link from 'next/link'
import type { Product } from '@shopping-mall/shared-types'
import { money } from './GuestChrome'
import { LoveButton } from './LoveButton'

export const shopProductGridClass = 'grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4'

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <p className="text-mute">Nothing here right now.</p>
  }

  return (
    <div className={shopProductGridClass}>
      {products.map((product) => (
        <Link key={product.id} href={`/shop/product/${product.id}`} className="mm-listing relative">
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
            <p className="mt-1 truncate text-xs text-mute">{product.vendor?.storeName ?? 'MMall'}</p>
            <p className="mt-1.5 text-glow">
              {money(product.price)}
              {product.comparePrice && product.comparePrice > product.price ? (
                <span className="ml-2 text-sm text-mute line-through">{money(product.comparePrice)}</span>
              ) : null}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
