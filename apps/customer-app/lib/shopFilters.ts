import type { Product, ShopperArea } from '@shopping-mall/shared-types'
import { deliveryLane, proximityScore } from '@shopping-mall/shared-types'
import { mallCategories, subcategoriesFor } from './mallCategories'

export type PriceBand = 'any' | 'under-250' | '250-750' | 'over-750' | 'custom'
export type SortMode = 'nearest' | 'price-asc' | 'price-desc'
export type ReachMode = 'all' | 'nearby'

export type ShopFilter = {
  sort: SortMode
  price: PriceBand
  reach: ReachMode
  category: string
  subcategory: string
  shops: string[]
  min: number | null
  max: number | null
}

export const defaultShopFilter: ShopFilter = {
  sort: 'nearest',
  price: 'any',
  reach: 'all',
  category: '',
  subcategory: '',
  shops: [],
  min: null,
  max: null,
}

export const categoryOptions = mallCategories.map((item) => ({
  id: item.name,
  label: item.name,
  icon: item.icon,
}))

export const sortOptions: { id: SortMode; label: string }[] = [
  { id: 'nearest', label: 'Nearest' },
  { id: 'price-asc', label: 'Price ↑' },
  { id: 'price-desc', label: 'Price ↓' },
]

export const priceOptions: { id: PriceBand; label: string }[] = [
  { id: 'any', label: 'Any price' },
  { id: 'under-250', label: 'Under R250' },
  { id: '250-750', label: 'R250–R750' },
  { id: 'over-750', label: 'R750+' },
  { id: 'custom', label: 'Custom' },
]

export const reachOptions: { id: ReachMode; label: string }[] = [
  { id: 'all', label: 'All of SA' },
  { id: 'nearby', label: 'Nearby' },
]

export function shopFilterSummary(filter: ShopFilter) {
  const parts: string[] = []
  if (filter.category) parts.push(filter.subcategory ? `${filter.category} · ${filter.subcategory}` : filter.category)
  if (filter.shops.length) parts.push(`${filter.shops.length} shop${filter.shops.length === 1 ? '' : 's'}`)
  if (filter.price === 'under-250') parts.push('Under R250')
  if (filter.price === '250-750') parts.push('R250–R750')
  if (filter.price === 'over-750') parts.push('R750+')
  if (filter.price === 'custom') {
    if (filter.min != null && filter.max != null) parts.push(`R${filter.min}–R${filter.max}`)
    else if (filter.min != null) parts.push(`From R${filter.min}`)
    else if (filter.max != null) parts.push(`Up to R${filter.max}`)
    else parts.push('Custom price')
  }
  if (filter.sort === 'price-asc') parts.push('Price ↑')
  if (filter.sort === 'price-desc') parts.push('Price ↓')
  if (filter.reach === 'nearby') parts.push('Nearby')
  return parts
}

export function isDefaultShopFilter(filter: ShopFilter) {
  return (
    filter.sort === 'nearest' &&
    filter.price === 'any' &&
    filter.reach === 'all' &&
    !filter.category &&
    !filter.subcategory &&
    filter.shops.length === 0 &&
    filter.min == null &&
    filter.max == null
  )
}

export function mergeShopFilter(filter: ShopFilter, patch: Partial<ShopFilter>): ShopFilter {
  const next = { ...filter, ...patch }
  if (patch.price && patch.price !== 'custom') {
    next.min = null
    next.max = null
  }
  if ('category' in patch && patch.category !== filter.category) {
    next.subcategory = ''
    next.shops = []
  }
  if ('subcategory' in patch && patch.subcategory !== filter.subcategory && !('shops' in patch)) {
    next.shops = []
  }
  return next
}

function inPriceRange(price: number, filter: ShopFilter) {
  if (filter.price === 'under-250') return price < 250
  if (filter.price === '250-750') return price >= 250 && price <= 750
  if (filter.price === 'over-750') return price > 750
  if (filter.price === 'custom') {
    const min = filter.min
    const max = filter.max
    if (min != null && max != null && min > max) return price >= max && price <= min
    if (min != null && price < min) return false
    if (max != null && price > max) return false
  }
  return true
}

export function applyShopFilter(products: Product[], filter: ShopFilter, area: ShopperArea | null) {
  return products
    .filter((product) => {
      if (filter.category && product.category !== filter.category) return false
      if (filter.subcategory && !product.tags.includes(filter.subcategory)) return false
      if (filter.shops.length && !filter.shops.includes(product.vendorId)) return false
      if (!inPriceRange(product.price, filter)) return false
      if (filter.reach === 'nearby' && area) {
        return deliveryLane(product.vendor?.city, area.city) === 'local'
      }
      return true
    })
    .sort((a, b) => {
      if (filter.sort === 'price-asc') return a.price - b.price
      if (filter.sort === 'price-desc') return b.price - a.price
      return (
        proximityScore(area, a.vendor?.city, a.vendor?.lat, a.vendor?.lng) -
        proximityScore(area, b.vendor?.city, b.vendor?.lat, b.vendor?.lng)
      )
    })
}

export { subcategoriesFor }
