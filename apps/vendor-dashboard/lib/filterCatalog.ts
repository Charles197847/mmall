import { mallCategories, subcategoriesFor } from './mallCategories'
import { mockProductsFor } from './mockCatalog'

export type FilterShop = {
  id: string
  storeName: string
  slug: string
  logo?: string
}

function catalogProducts() {
  return mallCategories.flatMap((item) => mockProductsFor(item.name, 14))
}

export function shopsForSubcategory(category: string, subcategory: string): FilterShop[] {
  const seen = new Set<string>()
  const shops: FilterShop[] = []
  for (const product of catalogProducts()) {
    if (product.category !== category) continue
    if (!product.tags.includes(subcategory)) continue
    if (seen.has(product.vendorId)) continue
    seen.add(product.vendorId)
    shops.push({
      id: product.vendorId,
      storeName: product.vendor?.storeName ?? 'Store',
      slug: product.vendor?.slug ?? product.vendorId,
      logo: product.vendor?.logo,
    })
  }
  return shops
}

export function subcategoryRows(category: string) {
  return subcategoriesFor(category).map((name) => ({
    name,
    shops: shopsForSubcategory(category, name),
  }))
}
