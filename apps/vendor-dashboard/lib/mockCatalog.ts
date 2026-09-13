import type { AdPlacement, Product, Vendor } from '@shopping-mall/shared-types'
import { findSaPlace, saPlaces } from '@shopping-mall/shared-types'
import { mallCategories, subcategoriesFor } from './mallCategories'

const photos = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=600&q=80',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
  'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
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

function placeForStore(storeName: string, index: number) {
  return findSaPlace(storeCities[storeName] ?? '') ?? saPlaces[index % saPlaces.length]
}

const samples: Record<string, string[]> = {
  Electronics: ['Noise-cancel earbuds', '4K monitor', 'USB-C hub', 'Smart watch', 'Mechanical keyboard', 'Webcam Pro', 'Portable SSD', 'LED desk lamp', 'Tablet folio', 'Bluetooth speaker', 'Power bank 20k', 'Wi-Fi 6 mesh'],
  Home: ['Linen duvet set', 'Oak side table', 'Ceramic vase', 'Wool throw', 'Kitchen knife set', 'Pour-over kettle', 'Floor lamp', 'Storage ottoman', 'Cotton towels', 'Scented candle trio', 'Wall clock', 'Plant stand'],
  Hypermarkets: ['Family rice 10kg', 'Olive oil 1L', 'Oat milk 6-pack', 'Dish tabs', 'Paper towels', 'Free-range eggs', 'Pasta trio', 'Tomato passata', 'Laundry pods', 'Still water case', 'Honey 500g', 'Granola box'],
  Fashion: ['Oversized shirt', 'Relaxed chinos', 'Merino knit', 'Denim jacket', 'Pleated skirt', 'Linen set', 'Everyday tee 3-pack', 'Tailored blazer', 'Cargo trousers', 'Silk scarf', 'Hoodie', 'Wide-leg jeans'],
  Footwear: ['Court sneakers', 'Trail runners', 'Leather loafers', 'Ankle boots', 'Slide sandals', 'Kids trainers', 'Office brogues', 'Canvas lows', 'Hiking boots', 'Ballet flats', 'Soccer boots', 'Recovery slides'],
  Jewelry: ['Gold hoop pair', 'Silver chain', 'Pearl studs', 'Signet ring', 'Tennis bracelet', 'Watch 36mm', 'Leather belt', 'Aviator frames', 'Drop earrings', 'Charm necklace', 'Cuff set', 'Minimal band'],
  Sportswear: ['Training tights', 'Dry-fit tee', 'Gym duffel', 'Resistance bands', 'Yoga mat', 'Running shorts', 'Sports bra', 'Cycling jersey', 'Grip socks', 'Cap', 'Hydro flask', 'Ankle weights'],
  Beauty: ['Vitamin C serum', 'SPF 50', 'Matte lipstick', 'Hydra cleanser', 'Night cream', 'Brow pencil', 'Perfume 50ml', 'Hair oil', 'Clay mask', 'Body butter', 'Makeup sponge set', 'Toner'],
  Salons: ['Cut & blow voucher', 'Gel manicure', 'Beard trim', 'Colour gloss', 'Scalp treatment', 'Express facial', 'Lash lift', 'Hot stone add-on', 'Kids cut', 'Keratin rinse', 'Spa hour', 'Barber fade'],
  'Food Court': ['Smash burger', 'Chicken wrap', 'Sushi box', 'Loaded fries', 'Gyoza 8pc', 'Poke bowl', 'Soft serve', 'Iced latte', 'Veggie roti', 'Wings 6pc', 'Falafel pitta', 'Milkshake'],
  Automotive: ['Cabin air filter', 'LED headlight pair', 'Phone mount', 'Dash cam 2K', 'Tyre inflator', 'Floor mat set', 'Jump starter', 'Wax kit', 'Wiper blades', 'Seat organiser', 'OBD scanner', 'Car vacuum'],
  Cinemas: ['IMAX ticket pair', 'VIP recliner night', 'Popcorn combo', 'Family 4-pack', 'Anime screening', 'Director cut', 'Arcade + film', 'Gold class', 'Kids matinee', '3D glasses pack', 'Season pass', 'Late show'],
  'Family Entertainment': ['Bowling hour', 'Escape room', 'Arcade card', 'Soft-play pass', 'Ice skate hire', 'Laser tag', 'VR session', 'Party package', 'Mini golf', 'Climbing intro', 'Karting lap', 'Photo booth'],
  Books: ['Hardcover bestseller', 'Notebook set', 'Fountain pen', 'Kids picture book', 'Cookbook', 'Travel guide', 'Puzzle 1000pc', 'Art monograph', 'Study pack', 'Bookmark tin', 'Magazine bundle', 'Board game'],
  Gifts: ['Gift hamper', 'Mug & tea set', 'Plush toy', 'Card box', 'Candle gift', 'Photo frame', 'Hobby kit', 'Wrap station', 'Keyring trio', 'Desk plant', 'Mini speaker', 'Keepsake box'],
  'Financial Services': ['Travel card', 'Forex desk', 'Safe-box month', 'Insurance consult', 'Card replacement', 'Cash send', 'Holiday cover', 'Student account', 'ATM card sleeve', 'Budget session', 'Remittance', 'Vault USB'],
  Health: ['Pharmacy hamper', 'Multivitamin', 'Eye test', 'First-aid kit', 'N95 10-pack', 'Protein tub', 'Thermometer', 'Hand gel pack', 'Clinic consult', 'Contact lenses', 'Sleep gummies', 'BP monitor'],
  Outdoor: ['Insulated bottle', 'Multi-tool', 'Camp chair', 'Headlamp', 'Rain shell', 'Daypack 20L', 'Sleeping liner', 'Trek poles', 'Dry bag', 'Fire starter', 'Camp mug', 'Trail snacks'],
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function vendorFor(index: number) {
  const storeName = stores[index % stores.length]
  const place = placeForStore(storeName, index)
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

export function mockProductsFor(category: string, count = 14): Product[] {
  const names = samples[category] ?? Array.from({ length: count }, (_, i) => `${category} pick ${i + 1}`)
  const subs = subcategoriesFor(category)
  return names.slice(0, count).map((name, index) => {
    const vendor = vendorFor(index + category.length)
    const subcategory = subs[index % (subs.length || 1)] ?? category
    return {
      id: `mock-${slugify(category)}-${index}`,
      vendorId: vendor.id,
      name,
      slug: slugify(name),
      description: `${name} from the ${category} court.`,
      price: 79 + ((index * 37 + category.length * 11) % 820),
      comparePrice: null,
      inventory: 24,
      images: [photos[(index + category.length) % photos.length]],
      category,
      tags: [category, subcategory],
      isActive: true,
      vendor,
    }
  })
}

export function mockFeatured(): Product[] {
  return mallCategories.flatMap((item, index) => mockProductsFor(item.name, 2).slice(0, index % 2 === 0 ? 2 : 1)).slice(0, 18)
}

export function findMockVendor(slug: string) {
  return mockVendors().find((vendor) => vendor.slug === slug) ?? null
}

export function mockVendors(): Vendor[] {
  return stores.map((storeName, index) => {
    const place = placeForStore(storeName, index)
    return {
      id: `mock-vendor-${slugify(storeName)}`,
      userId: `mock-user-${index}`,
      storeName,
      slug: slugify(storeName),
      description: `${storeName} on the MMall grid.`,
      logo: photos[index % photos.length],
      coverImage: null,
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
  })
}

export function mockAds(label: string, count = 8): AdPlacement[] {
  const campaigns = [
    { title: 'Weekend drop', headline: 'Featured vendor campaign', store: 'Velvet Lane' },
    { title: 'Outdoor week', headline: 'Gear up before Friday', store: 'Northline Supply' },
    { title: 'Home edit', headline: 'New season interiors', store: 'Harbor Home' },
    { title: 'Tech hour', headline: 'Devices on the grid', store: 'Acme Electronics' },
    { title: 'Beauty night', headline: 'Salon and skincare', store: 'Lumen Beauty' },
    { title: 'Kitchen edit', headline: 'Cookware on offer', store: 'Cape Kitchen' },
    { title: 'Sport rush', headline: 'Training kit sale', store: 'Atlas Sport' },
    { title: 'Plaza reads', headline: 'New hardcovers', store: 'Plaza Books' },
  ]
  return Array.from({ length: count }, (_, index) => {
    const campaign = campaigns[index % campaigns.length]
    return {
      id: `mock-ad-${slugify(label)}-${index + 1}`,
      slot: 'HOMEPAGE_BANNER' as const,
      title: `${label} · ${campaign.title}`,
      headline: campaign.headline,
      imageUrl: photos[(index + label.length) % photos.length],
      vendorName: campaign.store,
      vendorSlug: slugify(campaign.store),
    }
  })
}
