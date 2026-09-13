import type { Product } from '@shopping-mall/shared-types'

export function storeHref(product: Pick<Product, 'id' | 'vendor'>) {
  return `/(customer)/product/${product.id}` as const
}
