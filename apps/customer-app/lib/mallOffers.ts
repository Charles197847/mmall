import type { Product } from '@shopping-mall/shared-types'
import { mallCategories } from './mallCategories'
import { mockProductsFor } from './catalog'

function catalog(): Product[] {
  return mallCategories.flatMap((item) => mockProductsFor(item.name, 8))
}

export function mallSpecials(): Product[] {
  return catalog()
    .filter((_, index) => index % 3 === 0)
    .map((product) => ({ ...product, comparePrice: Math.round(product.price * 1.22) }))
}

export function mallBestsellers(): Product[] {
  return [...catalog()]
    .map((product, index) => {
      const sold = 18 + ((index * 29 + product.name.length) % 240)
      return {
        ...product,
        reviewCount: sold,
        rating: 4 + ((index + product.name.length) % 10) / 10,
      }
    })
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 24)
}
