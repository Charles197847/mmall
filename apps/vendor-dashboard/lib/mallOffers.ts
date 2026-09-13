import type { Product } from '@shopping-mall/shared-types'
import { mallCategories } from './mallCategories'
import { mockProductsFor } from './mockCatalog'

function catalog(): Product[] {
  return mallCategories.flatMap((item) => mockProductsFor(item.name, 14))
}

export function mallSpecials(): Product[] {
  return catalog()
    .map((product, index) => {
      if (index % 3 !== 0) return null
      return { ...product, comparePrice: Math.round(product.price * 1.22) }
    })
    .filter((product): product is Product => Boolean(product))
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
