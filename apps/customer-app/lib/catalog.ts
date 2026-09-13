import type { Paginated, Product, Vendor } from '@shopping-mall/shared-types'
import { findSaPlace, saPlaces } from '@shopping-mall/shared-types'
import { api } from './api'
import { mallCategories } from './mallCategories'
import { withSellerDetail } from './productDetail'

const photos = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&q=80',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
]

const stores = [
  'Northline Supply',
  'Harbor Home',
  'Acme Electronics',
  'Velvet Lane',
  'Cape Kitchen',
  'Atlas Sport',
  'Lumen Beauty',
  'Plaza Books',
  'Bay Home',
  'Karoo Reads',
  'Lowveld Outdoor',
  'Limpopo Market',
]

const storeCities: Record<string, string> = {
  'Northline Supply': 'Durban',
  'Harbor Home': 'Cape Town',
  'Acme Electronics': 'Sandton',
  'Velvet Lane': 'Johannesburg',
  'Cape Kitchen': 'Stellenbosch',
  'Atlas Sport': 'Pretoria',
  'Lumen Beauty': 'Umhlanga',
  'Plaza Books': 'Bloemfontein',
  'Bay Home': 'Gqeberha',
  'Karoo Reads': 'Kimberley',
  'Lowveld Outdoor': 'Mbombela',
  'Limpopo Market': 'Polokwane',
}

const samples: Record<string, string[]> = {
  Electronics: ['Noise-cancel earbuds', '4K monitor', 'USB-C hub', 'Smart watch', 'Mechanical keyboard', 'Webcam Pro', 'Portable SSD', 'LED desk lamp'],
  Home: ['Linen duvet set', 'Oak side table', 'Ceramic vase', 'Wool throw', 'Kitchen knife set', 'Pour-over kettle', 'Floor lamp', 'Storage ottoman'],
  Fashion: ['Oversized shirt', 'Relaxed chinos', 'Merino knit', 'Denim jacket', 'Pleated skirt', 'Linen set', 'Everyday tee 3-pack', 'Tailored blazer'],
  Footwear: ['Court sneakers', 'Trail runners', 'Leather loafers', 'Ankle boots', 'Slide sandals', 'Kids trainers', 'Office brogues', 'Canvas lows'],
  Beauty: ['Vitamin C serum', 'SPF 50', 'Matte lipstick', 'Hydra cleanser', 'Night cream', 'Brow pencil', 'Perfume 50ml', 'Hair oil'],
  Automotive: ['Cabin air filter', 'LED headlight pair', 'Phone mount', 'Dash cam 2K', 'Tyre inflator', 'Floor mat set', 'Jump starter', 'Wax kit'],
  Books: ['Hardcover bestseller', 'Notebook set', 'Fountain pen', 'Kids picture book', 'Cookbook', 'Travel guide', 'Puzzle 1000pc', 'Art monograph'],
  Sportswear: ['Training tights', 'Dry-fit tee', 'Gym duffel', 'Resistance bands', 'Yoga mat', 'Running shorts', 'Sports bra', 'Cycling jersey'],
  Health: ['Pharmacy hamper', 'Multivitamin', 'Eye test', 'First-aid kit', 'N95 10-pack', 'Protein tub', 'Thermometer', 'Hand gel pack'],
  Outdoor: ['Insulated bottle', 'Multi-tool', 'Camp chair', 'Headlamp', 'Rain shell', 'Daypack 20L', 'Sleeping liner', 'Trek poles'],
  'Food Court': ['Smash burger', 'Chicken wrap', 'Sushi box', 'Loaded fries', 'Gyoza 8pc', 'Poke bowl', 'Soft serve', 'Iced latte'],
  Gifts: ['Gift hamper', 'Mug & tea set', 'Plush toy', 'Card box', 'Candle gift', 'Photo frame', 'Hobby kit', 'Keepsake box'],
  Hypermarkets: ['Family rice 10kg', 'Olive oil 1L', 'Oat milk 6-pack', 'Dish tabs', 'Paper towels', 'Free-range eggs', 'Pasta trio', 'Laundry pods'],
  Jewelry: ['Gold hoop pair', 'Silver chain', 'Pearl studs', 'Signet ring', 'Tennis bracelet', 'Watch 36mm', 'Drop earrings', 'Minimal band'],
  Salons: ['Cut & blow voucher', 'Gel manicure', 'Beard trim', 'Colour gloss', 'Express facial', 'Lash lift', 'Kids cut', 'Spa hour'],
  Cinemas: ['IMAX ticket pair', 'VIP recliner night', 'Popcorn combo', 'Family 4-pack', 'Gold class', 'Kids matinee', 'Season pass', 'Late show'],
  'Family Entertainment': ['Bowling hour', 'Escape room', 'Arcade card', 'Soft-play pass', 'Laser tag', 'VR session', 'Mini golf', 'Karting lap'],
  'Financial Services': ['Travel card', 'Forex desk', 'Safe-box month', 'Insurance consult', 'Holiday cover', 'Student account', 'Budget session', 'Remittance'],
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function vendorFor(index: number) {
  const storeName = stores[index % stores.length]
  const place = findSaPlace(storeCities[storeName] ?? '') ?? saPlaces[index % saPlaces.length]
  return {
    id: `mock-vendor-${slugify(storeName)}`,
    storeName,
    slug: slugify(storeName),
    logo: photos[index % photos.length],
    city: place.city,
    province: place.province,
    lat: place.lat,
    lng: place.lng,
  }
}

export function mockProductsFor(category: string, count = 8): Product[] {
  const names = samples[category] ?? Array.from({ length: count }, (_, i) => `${category} pick ${i + 1}`)
  return names.slice(0, count).map((name, index) => {
    const vendor = vendorFor(index + category.length)
    return withSellerDetail({
      id: `mock-${slugify(category)}-${index}`,
      vendorId: vendor.id,
      name,
      slug: slugify(name),
      description: `${name} from the ${category} court at MMall.`,
      price: 79 + ((index * 37 + category.length * 11) % 820),
      comparePrice: index % 3 === 0 ? 79 + ((index * 37 + category.length * 11) % 820) + 80 : null,
      inventory: 24,
      images: [photos[(index + category.length) % photos.length]],
      category,
      tags: [category],
      isActive: true,
      vendor,
    })
  })
}

export function mockFeatured(): Product[] {
  return mallCategories
    .flatMap((item, index) => mockProductsFor(item.name, 2).slice(0, index % 2 === 0 ? 2 : 1))
    .slice(0, 16)
}

export function mockSpecials(): Product[] {
  return mockFeatured().filter((item) => item.comparePrice).slice(0, 10)
}

export function mockVendors(): Vendor[] {
  return stores.map((storeName, index) => {
    const place = findSaPlace(storeCities[storeName] ?? '') ?? saPlaces[index % saPlaces.length]
    const vendor: Vendor = {
      id: `mock-vendor-${slugify(storeName)}`,
      userId: `mock-user-${index}`,
      storeName,
      slug: slugify(storeName),
      description: `${storeName} on the MMall grid.`,
      logo: photos[index % photos.length],
      coverImage: photos[(index + 3) % photos.length],
      isActive: true,
      isApproved: true,
      commissionRate: 0.1,
      settings: null,
      city: place.city,
      province: place.province,
      postalCode: place.postalCode,
      lat: place.lat,
      lng: place.lng,
    }
    return { ...vendor, products: mockProductsForVendor(vendor) }
  })
}

export function findMockVendor(slug: string) {
  return mockVendors().find((vendor) => vendor.slug === slug) ?? null
}

export function mockProductsForVendor(vendor: Pick<Vendor, 'id' | 'storeName' | 'slug' | 'logo'>) {
  return mallCategories
    .flatMap((item) => mockProductsFor(item.name, 8))
    .filter((item) => item.vendorId === vendor.id)
    .map((item) => ({
      ...item,
      vendor: {
        id: vendor.id,
        storeName: vendor.storeName,
        slug: vendor.slug,
        logo: vendor.logo,
      },
    }))
}

export function findMockProduct(id: string) {
  if (!id.startsWith('mock-')) return null
  for (const category of mallCategories) {
    const match = mockProductsFor(category.name, 12).find((item) => item.id === id)
    if (match) return match
  }
  return null
}

function mockProductPage(params?: {
  q?: string
  category?: string
  vendorId?: string
  excludeVendorId?: string
  page?: number
  limit?: number
}): Paginated<Product> {
  const category = params?.category
  let items = category
    ? mockProductsFor(category, 12)
    : mallCategories.flatMap((item) => mockProductsFor(item.name, 4))

  if (params?.q) {
    const q = params.q.toLowerCase()
    items = items.filter((item) => item.name.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q))
  }
  if (params?.vendorId) items = items.filter((item) => item.vendorId === params.vendorId)
  if (params?.excludeVendorId) items = items.filter((item) => item.vendorId !== params.excludeVendorId)

  const page = params?.page ?? 1
  const limit = params?.limit ?? items.length
  const start = (page - 1) * limit
  return { items: items.slice(start, start + limit), total: items.length, page, limit }
}

export async function loadProducts(params?: {
  q?: string
  category?: string
  vendorId?: string
  excludeVendorId?: string
  page?: number
  limit?: number
}) {
  try {
    const data = await api.products.list(params)
    if (data.items?.length) {
      return { ...data, items: data.items.map((item) => withSellerDetail(item)) }
    }
  } catch {
    /* phone builds often cannot reach localhost — show the mall grid anyway */
  }
  return mockProductPage(params)
}

export async function loadProduct(id: string) {
  const mock = findMockProduct(id)
  if (mock) return mock
  try {
    return withSellerDetail(await api.products.get(id))
  } catch {
    return null
  }
}

export async function loadVendors() {
  try {
    const live = await api.vendors.list()
    if (live.length) return live
  } catch {
    /* use court stores */
  }
  return mockVendors()
}

export async function loadVendor(slug: string) {
  try {
    const live = await api.vendors.get(slug)
    if (live) {
      if (!live.products?.length) {
        return { ...live, products: mockProductsForVendor(live) }
      }
      return live
    }
  } catch {
    /* use court store */
  }
  return findMockVendor(slug)
}
