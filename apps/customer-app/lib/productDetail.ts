import type { Product, ProductOption, ProductReview, ProductSpec } from '@shopping-mall/shared-types'

type ProductKind =
  | 'apparel'
  | 'footwear'
  | 'book'
  | 'home'
  | 'electronics'
  | 'beauty'
  | 'grocery'
  | 'ticket'
  | 'service'
  | 'generic'

function productKind(category?: string | null): ProductKind {
  switch (category) {
    case 'Fashion':
    case 'Sportswear':
      return 'apparel'
    case 'Footwear':
      return 'footwear'
    case 'Books':
      return 'book'
    case 'Home':
    case 'Outdoor':
    case 'Gifts':
    case 'Automotive':
      return 'home'
    case 'Electronics':
      return 'electronics'
    case 'Beauty':
    case 'Jewelry':
      return 'beauty'
    case 'Food Court':
    case 'Health':
      return 'grocery'
    default:
      return 'generic'
  }
}

export function withSellerDetail(product: Product): Product {
  if (product.options || product.specs || product.reviews || product.styleNotes || product.fromShop) {
    return product
  }

  const seed = product.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const kind = productKind(product.category)
  const sellerFilled = seed % 5 !== 0
  const reviews = sellerFilled ? buildReviews(product, seed) : []
  const rating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : product.rating

  return {
    ...product,
    images: extraImages(product, seed),
    options: sellerFilled ? optionsFor(kind, product.name) : undefined,
    specs: sellerFilled ? specsFor(kind, product) : undefined,
    styleNotes: sellerFilled ? styleFor(kind, product) : undefined,
    fromShop: sellerFilled ? fromShopFor(kind, product) : undefined,
    reviews,
    rating,
    reviewCount: reviews.length || product.reviewCount,
    comparePrice: sellerFilled && seed % 3 === 0 ? Math.round(product.price * 1.18) : product.comparePrice,
  }
}

export function reviewsFromApi(product: Product): ProductReview[] {
  const raw = product.reviews
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw
}

function extraImages(product: Product, seed: number) {
  const extras = [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
  ]
  const primary = product.images[0]
  if (!primary) return extras.slice(0, 3)
  return [primary, extras[(seed + 1) % extras.length], extras[(seed + 2) % extras.length]].filter(
    (url, index, list) => list.indexOf(url) === index,
  )
}

function optionsFor(kind: ProductKind, name: string): ProductOption[] | undefined {
  if (kind === 'footwear') {
    return [
      { name: 'Size', values: ['5', '6', '7', '8', '9', '10', '11'] },
      { name: 'Colour', values: ['Black', 'White', 'Navy'] },
    ]
  }
  if (kind === 'apparel') {
    return [
      { name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL'] },
      { name: 'Colour', values: ['Black', 'Ivory', 'Ink'] },
    ]
  }
  if (kind === 'book') return [{ name: 'Format', values: ['Hardcover', 'Paperback'] }]
  if (kind === 'home') return [{ name: 'Finish', values: ['Oak', 'Walnut', 'Stone'] }]
  if (kind === 'electronics') return [{ name: 'Colour', values: ['Graphite', 'Silver'] }]
  if (kind === 'beauty' && /lipstick|brow|sponge|mask/i.test(name)) {
    return [{ name: 'Shade', values: ['Fair', 'Medium', 'Deep'] }]
  }
  return undefined
}

function specsFor(kind: ProductKind, product: Product): ProductSpec[] | undefined {
  if (kind === 'electronics') {
    return [
      { label: 'Warranty', value: '12 months' },
      { label: 'Power', value: 'USB-C' },
    ]
  }
  if (kind === 'footwear' || kind === 'apparel') {
    return [
      { label: 'Fit', value: 'True to size' },
      { label: 'Care', value: 'Wipe clean / cool wash' },
    ]
  }
  if (kind === 'home') {
    return [
      { label: 'Material', value: 'Solid wood / linen' },
      { label: 'Assembly', value: 'Arrives assembled' },
    ]
  }
  return [{ label: 'Court', value: product.category ?? 'MMall' }]
}

function styleFor(kind: ProductKind, product: Product) {
  if (kind === 'footwear') return 'Court silhouette with a daily last. Built for mall walking and weekend miles.'
  if (kind === 'apparel') return 'Cut for movement through the courts. Layer it or wear it as the piece.'
  if (kind === 'electronics') return 'Grid-ready daily driver. Specs stay honest; no inflated peak claims.'
  return `Styled by the seller for the ${product.category ?? 'mall'} court.`
}

function fromShopFor(kind: ProductKind, product: Product) {
  const store = product.vendor?.storeName ?? 'This store'
  if (kind === 'service') return `${store} fulfils this in-court. Confirm time at the shop desk.`
  return `${store} packed this from their MMall shop floor.`
}

function buildReviews(product: Product, seed: number): ProductReview[] {
  const lines = [
    ['Worth the walk', 'Arrived as shown. The shop packing was tight and clean.'],
    ['Daily use', 'Using it this week. Finish is better than the photo suggested.'],
    ['Store pick', 'Bought after browsing the court. Would go back to this vendor.'],
  ]
  const count = 2 + (seed % 2)
  return lines.slice(0, count).map((line, index) => ({
    id: `${product.id}-review-${index}`,
    rating: 4 + ((seed + index) % 2),
    title: line[0],
    content: line[1],
    author: ['Lerato M.', 'James K.', 'Ayesha P.'][index],
    createdAt: new Date(2026, 5, 4 + index).toISOString(),
  }))
}
