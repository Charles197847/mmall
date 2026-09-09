import type { CategoryCommission, FeeBreakdown, PlatformSettings } from '@shopping-mall/shared-types'

export const defaultCategoryCommissions: CategoryCommission[] = [
  {
    id: 'electronics',
    label: 'Electronics & Computers',
    rate: 5,
    match: ['electronics', 'computers', 'wearables', 'audio'],
    examples: 'Laptops, smartphones, audio gear, PC components',
  },
  {
    id: 'appliances',
    label: 'Home Appliances & Hardware',
    rate: 7,
    match: ['appliances', 'hardware', 'tools'],
    examples: 'Kitchen appliances, power tools, home fittings',
  },
  {
    id: 'general',
    label: 'General Merchandise & Home',
    rate: 10,
    match: ['home', 'outdoor', 'sports', 'toys', 'books', 'furniture'],
    examples: 'Furniture, decor, outdoor equipment, toys',
  },
  {
    id: 'beauty',
    label: 'Beauty, Health & Personal Care',
    rate: 12,
    match: ['beauty', 'health', 'personal care'],
    examples: 'Cosmetics, skincare, supplements',
  },
  {
    id: 'fashion',
    label: 'Fashion, Apparel & Accessories',
    rate: 15,
    match: ['fashion', 'apparel', 'accessories', 'clothing'],
    examples: 'Clothing, footwear, jewelry, luggage',
  },
  {
    id: 'digital',
    label: 'Digital Goods & Software',
    rate: 15,
    match: ['digital', 'software'],
    examples: 'Digital downloads, e-books, course materials',
  },
]

export const defaultPlatformSettings: PlatformSettings = {
  defaultCommission: 10,
  minPayoutAmount: 10,
  currency: 'ZAR',
  shippingDefault: 0,
  monthlyPlatformFee: 599,
  gatewayPercent: 2.5,
  gatewayFixed: 2,
  withdrawalFee: 10,
  categoryCommissions: defaultCategoryCommissions,
  logoGenerationPrice: 299,
  bannerGenerationPrice: 599,
  homepageBannerWeeklyPrice: 1500,
  searchFeatureWeeklyPrice: 900,
  shopHighlightWeeklyPrice: 600,
  pushBlastMinPrice: 5000,
  pushBlastMaxPrice: 10000,
  pushBlastAudience: 200000,
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function commissionRateForCategory(category: string | null | undefined, settings: PlatformSettings) {
  const key = (category ?? '').trim().toLowerCase()
  if (key) {
    const bands = settings.categoryCommissions?.length
      ? settings.categoryCommissions
      : defaultCategoryCommissions
    const match = bands.find((band) =>
      band.match.some((token) => key === token || key.includes(token) || token.includes(key)),
    )
    if (match) return match.rate
  }
  return settings.defaultCommission
}

export function orderGatewayFee(orderTotal: number, settings: PlatformSettings) {
  return roundMoney(orderTotal * (settings.gatewayPercent / 100) + settings.gatewayFixed)
}

export function allocateGatewayFee(orderTotal: number, vendorSubtotal: number, settings: PlatformSettings) {
  const totalFee = orderGatewayFee(orderTotal, settings)
  if (orderTotal <= 0) return 0
  return roundMoney(totalFee * (vendorSubtotal / orderTotal))
}

export function settleVendorSale(input: {
  items: Array<{ total: number; category?: string | null }>
  orderTotal: number
  settings: PlatformSettings
}): FeeBreakdown {
  const subtotal = roundMoney(input.items.reduce((sum, item) => sum + item.total, 0))
  const commission = roundMoney(
    input.items.reduce((sum, item) => {
      const rate = commissionRateForCategory(item.category, input.settings)
      return sum + item.total * (rate / 100)
    }, 0),
  )
  const gatewayFee = allocateGatewayFee(input.orderTotal, subtotal, input.settings)
  const weightedRate = subtotal > 0 ? roundMoney((commission / subtotal) * 100) : 0
  return {
    subtotal,
    commission,
    commissionRate: weightedRate,
    gatewayFee,
    payoutAmount: roundMoney(subtotal - commission - gatewayFee),
  }
}
