export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN'
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type VendorOrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: Role
}

export interface AuthResponse {
  token: string
  user: User
}

export interface VendorSettings {
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
  banner: string | null
  socialLinks: {
    instagram?: string
    facebook?: string
    twitter?: string
  }
}

export interface Vendor {
  id: string
  userId: string
  storeName: string
  slug: string
  description: string | null
  logo: string | null
  coverImage: string | null
  isActive: boolean
  isApproved: boolean
  commissionRate: number
  stripeAccountId?: string | null
  settings: VendorSettings | null
  createdAt?: string
  user?: Pick<User, 'email' | 'firstName' | 'lastName'>
  products?: Product[]
}

export interface Product {
  id: string
  vendorId: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  inventory: number
  images: string[]
  category: string | null
  tags: string[]
  isActive: boolean
  rating?: number
  reviewCount?: number
  vendor?: Pick<Vendor, 'storeName' | 'slug' | 'logo' | 'id'>
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface Address {
  fullName: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

export interface OrderItem {
  id: string
  orderId: string
  vendorId: string
  productId: string
  quantity: number
  price: number
  total: number
  product?: Product
}

export interface VendorOrder {
  id: string
  orderId: string
  vendorId: string
  status: VendorOrderStatus
  subtotal: number
  commission: number
  gatewayFee?: number
  payoutAmount: number
  feeBreakdown?: FeeBreakdown | null
  shippingCarrier?: string | null
  trackingNumber?: string | null
}

export interface Order {
  id: string
  customerId: string
  status: OrderStatus
  totalAmount: number
  subtotal: number
  tax: number
  shippingTotal: number
  discountTotal: number
  paymentIntentId?: string | null
  paymentStatus: PaymentStatus
  shippingAddress: Address
  billingAddress?: Address | null
  items?: OrderItem[]
  vendorOrders?: VendorOrder[]
  customer?: Pick<User, 'email' | 'firstName' | 'lastName'>
  createdAt?: string
}

export interface Review {
  id: string
  productId: string
  customerId: string
  rating: number
  title?: string | null
  content: string
  images: string[]
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
  vendorId: string
  vendorName: string
  maxQuantity: number
}

export interface PlatformStats {
  totalRevenue: number
  revenueGrowth: number
  totalOrders: number
  orderGrowth: number
  activeVendors: number
  pendingVendors: number
  totalProducts: number
  recentOrders?: Array<{
    id: string
    totalAmount: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    createdAt: string
    customer?: Pick<User, 'email' | 'firstName' | 'lastName'>
  }>
}

export interface CategoryCommission {
  id: string
  label: string
  rate: number
  match: string[]
  examples: string
}

export interface PlatformSettings {
  defaultCommission: number
  minPayoutAmount: number
  currency: string
  shippingDefault: number
  monthlyPlatformFee: number
  gatewayPercent: number
  gatewayFixed: number
  withdrawalFee: number
  categoryCommissions: CategoryCommission[]
  logoGenerationPrice: number
  bannerGenerationPrice: number
  homepageBannerWeeklyPrice: number
  searchFeatureWeeklyPrice: number
  shopHighlightWeeklyPrice: number
  pushBlastMinPrice: number
  pushBlastMaxPrice: number
  pushBlastAudience: number
}

export interface FeeBreakdown {
  subtotal: number
  commission: number
  commissionRate: number
  gatewayFee: number
  payoutAmount: number
}

export interface AdminUser extends User {
  createdAt?: string
  vendorProfile?: { storeName: string; slug: string } | null
}

export interface VendorAnalytics {
  totalOrders: number
  totalProducts: number
  totalRevenue: number
  pendingOrders: number
  salesTrend: Array<{ date: string; sales: number }>
}

export interface VendorOrderRow extends VendorOrder {
  order?: {
    id: string
    createdAt: string
    customer?: Pick<User, 'firstName' | 'lastName' | 'email'>
    items?: Array<OrderItem & { product?: Pick<Product, 'name'> }>
  }
}

export interface PaymentIntentResponse {
  clientSecret: string | null
  paymentIntentId: string
}

export const FREE_GENERATIONS_PER_ASSET = 5

export type GenerationAssetType = 'LOGO' | 'BANNER'
export type AdSlot = 'HOMEPAGE_BANNER' | 'SEARCH_FEATURE' | 'SHOP_HIGHLIGHT' | 'PUSH_BLAST'
export type AdCampaignStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED'

export interface GenerationQuota {
  assetType: GenerationAssetType
  freeLimit: number
  freeUsed: number
  freeRemaining: number
  paidCredits: number
  unitPrice: number
  canGenerate: boolean
}

export interface GenerationJob {
  id: string
  vendorId: string
  assetType: GenerationAssetType
  prompt: string
  imageUrl: string
  provider: string
  billedAs: string
  createdAt: string
}

export interface AdCampaign {
  id: string
  vendorId: string
  slot: AdSlot
  title: string
  headline?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  status: AdCampaignStatus
  startsAt: string
  endsAt: string
  price: number
  impressions: number
  clicks: number
  audienceSize?: number | null
  createdAt?: string
  vendor?: Pick<Vendor, 'storeName' | 'slug' | 'logo'>
}

export interface AdPlacement {
  id: string
  slot: AdSlot
  title: string
  headline?: string | null
  imageUrl?: string | null
  linkUrl?: string | null
  vendorName: string
  vendorSlug: string
}

export interface AppNotification {
  id: string
  title: string
  body: string
  data?: Record<string, unknown> | null
  createdAt: string
}

export function formatMoney(amount: number, currency = 'ZAR') {
  const value = Number.isFinite(amount) ? amount : 0
  if (currency === 'ZAR') return `R${value.toFixed(2)}`
  if (currency === 'EUR') return `€${value.toFixed(2)}`
  if (currency === 'GBP') return `£${value.toFixed(2)}`
  return `$${value.toFixed(2)}`
}
