import type { Product } from '@shopping-mall/shared-types'

export function storeHref(product: Pick<Product, 'id' | 'vendor'>) {
  const slug = product.vendor?.slug
  if (slug) return `/(customer)/vendor/${slug}?product=${product.id}` as const
  return `/(customer)/product/${product.id}` as const
}
