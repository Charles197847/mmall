import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@shopping-mall.local' },
    update: {},
    create: {
      email: 'admin@shopping-mall.local',
      firstName: 'Platform',
      lastName: 'Admin',
      role: 'ADMIN',
      passwordHash,
    },
  })

  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@shopping-mall.local' },
    update: {},
    create: {
      email: 'vendor@shopping-mall.local',
      firstName: 'Avery',
      lastName: 'Stone',
      role: 'VENDOR',
      passwordHash,
    },
  })

  const harborUser = await prisma.user.upsert({
    where: { email: 'harbor@shopping-mall.local' },
    update: {},
    create: {
      email: 'harbor@shopping-mall.local',
      firstName: 'Mina',
      lastName: 'Harbor',
      role: 'VENDOR',
      passwordHash,
    },
  })

  const northlineUser = await prisma.user.upsert({
    where: { email: 'northline@shopping-mall.local' },
    update: {},
    create: {
      email: 'northline@shopping-mall.local',
      firstName: 'Jules',
      lastName: 'North',
      role: 'VENDOR',
      passwordHash,
    },
  })

  const customer = await prisma.user.upsert({
    where: { email: 'customer@shopping-mall.local' },
    update: {},
    create: {
      email: 'customer@shopping-mall.local',
      firstName: 'Casey',
      lastName: 'Nguyen',
      role: 'CUSTOMER',
      passwordHash,
    },
  })

  const acme = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {
      storeName: 'Acme Electronics',
      description: 'Premium electronics, gadgets, and tech accessories.',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop',
      isActive: true,
      isApproved: true,
      city: 'Sandton',
      province: 'Gauteng',
      postalCode: '2196',
      lat: -26.1076,
      lng: 28.0567,
    },
    create: {
      userId: vendorUser.id,
      storeName: 'Acme Electronics',
      slug: 'acme',
      description: 'Premium electronics, gadgets, and tech accessories.',
      logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop',
      isActive: true,
      isApproved: true,
      city: 'Sandton',
      province: 'Gauteng',
      postalCode: '2196',
      lat: -26.1076,
      lng: 28.0567,
      commissionRate: 10,
      settings: {
        theme: { primaryColor: '#2563eb', secondaryColor: '#6b7280', fontFamily: 'Inter' },
        banner: null,
        socialLinks: { instagram: 'https://instagram.com/acme' },
      },
    },
  })

  const harbor = await prisma.vendor.upsert({
    where: { userId: harborUser.id },
    update: {
      isActive: true,
      isApproved: true,
      logo: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=200&h=200&fit=crop',
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001',
      lat: -33.9249,
      lng: 18.4241,
    },
    create: {
      userId: harborUser.id,
      storeName: 'Harbor Home',
      slug: 'harbor',
      description: 'Calm, well-made objects for daily living.',
      logo: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=200&h=200&fit=crop',
      isActive: true,
      isApproved: true,
      city: 'Cape Town',
      province: 'Western Cape',
      postalCode: '8001',
      lat: -33.9249,
      lng: 18.4241,
      commissionRate: 12,
      settings: {
        theme: { primaryColor: '#0f766e', secondaryColor: '#134e4a', fontFamily: 'Inter' },
        banner: null,
        socialLinks: {},
      },
    },
  })

  const northline = await prisma.vendor.upsert({
    where: { userId: northlineUser.id },
    update: {
      storeName: 'Northline Supply',
      description: 'Heavy-duty outdoor gear, camping equipment, and industrial supplies.',
      logo: 'https://images.unsplash.com/photo-1539085023575-5c9ad6c0f15a?w=200&h=200&fit=crop',
      isActive: true,
      isApproved: true,
      commissionRate: 12,
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4001',
      lat: -29.8587,
      lng: 31.0218,
    },
    create: {
      userId: northlineUser.id,
      storeName: 'Northline Supply',
      slug: 'northline',
      description: 'Heavy-duty outdoor gear, camping equipment, and industrial supplies.',
      logo: 'https://images.unsplash.com/photo-1539085023575-5c9ad6c0f15a?w=200&h=200&fit=crop',
      isActive: true,
      isApproved: true,
      city: 'Durban',
      province: 'KwaZulu-Natal',
      postalCode: '4001',
      lat: -29.8587,
      lng: 31.0218,
      commissionRate: 12,
      settings: {
        theme: { primaryColor: '#dc2626', secondaryColor: '#78350f', fontFamily: 'Inter' },
        banner: null,
        socialLinks: {},
      },
    },
  })

  const catalog = [
    {
      vendorId: acme.id,
      slug: 'acme-ceramic-mug',
      name: 'Acme Ceramic Mug',
      description: 'A sturdy 12oz ceramic mug for daily coffee.',
      price: 18,
      comparePrice: 24,
      inventory: 120,
      category: 'Home',
      tags: ['kitchen', 'drinkware'],
      images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80'],
    },
    {
      vendorId: acme.id,
      slug: 'acme-linen-tote',
      name: 'Acme Linen Tote',
      description: 'Reusable tote bag with reinforced handles.',
      price: 32,
      inventory: 80,
      category: 'Fashion',
      tags: ['bags', 'everyday'],
      images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80'],
    },
    {
      vendorId: acme.id,
      slug: 'acme-wireless-earbuds',
      name: 'Acme Wireless Earbuds',
      description: 'Compact earbuds with a 24-hour charging case.',
      price: 79,
      comparePrice: 99,
      inventory: 45,
      category: 'Electronics',
      tags: ['audio', 'wireless'],
      images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80'],
    },
    {
      vendorId: acme.id,
      slug: 'acme-field-notebook',
      name: 'Acme Field Notebook',
      description: 'Pocket-size notebook with numbered pages.',
      price: 12,
      inventory: 200,
      category: 'Books',
      tags: ['stationery', 'writing'],
      images: ['https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=800&q=80'],
    },
    {
      vendorId: acme.id,
      slug: 'ultrabook-pro-laptop',
      name: 'UltraBook Pro Laptop',
      description: '15.6" 4K OLED display, Intel Core i9, 32GB RAM, 1TB SSD.',
      price: 1999.99,
      comparePrice: 2499.99,
      inventory: 25,
      category: 'Electronics',
      tags: ['laptop', 'tech', 'premium'],
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
        'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
      ],
    },
    {
      vendorId: acme.id,
      slug: 'noise-cancelling-pro-earbuds',
      name: 'Noise-Cancelling Pro Earbuds',
      description: 'Active noise cancellation, 40-hour battery, IPX7 waterproof.',
      price: 249.99,
      comparePrice: 299.99,
      inventory: 50,
      category: 'Electronics',
      tags: ['audio', 'wireless', 'headphones'],
      images: ['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80'],
    },
    {
      vendorId: acme.id,
      slug: 'smart-health-watch-6',
      name: 'Smart Health Watch 6',
      description: 'Heart rate, blood oxygen, GPS, and 7-day battery life.',
      price: 399.99,
      inventory: 30,
      category: 'Electronics',
      tags: ['smartwatch', 'fitness', 'health'],
      images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80'],
    },
    {
      vendorId: acme.id,
      slug: 'gaming-rgb-keyboard-pro',
      name: 'Gaming RGB Keyboard Pro',
      description: 'Mechanical keys, RGB lighting, and programmable macros.',
      price: 149.99,
      comparePrice: 199.99,
      inventory: 40,
      category: 'Electronics',
      tags: ['gaming', 'keyboard', 'rgb'],
      images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80'],
    },
    {
      vendorId: harbor.id,
      slug: 'harbor-linen-throw',
      name: 'Harbor Linen Throw',
      description: 'Soft washed-linen throw for the sofa or bed.',
      price: 64,
      inventory: 36,
      category: 'Home',
      tags: ['textile', 'living'],
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
    },
    {
      vendorId: harbor.id,
      slug: 'harbor-citrus-soap',
      name: 'Harbor Citrus Soap',
      description: 'Cold-process bar soap with orange and bergamot.',
      price: 14,
      inventory: 90,
      category: 'Beauty',
      tags: ['bath', 'natural'],
      images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80'],
    },
    {
      vendorId: harbor.id,
      slug: 'harbor-water-bottle',
      name: 'Harbor Steel Bottle',
      description: 'Insulated 750ml bottle that keeps drinks cold all day.',
      price: 28,
      inventory: 70,
      category: 'Sports',
      tags: ['outdoors', 'hydrate'],
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
    },
    {
      vendorId: northline.id,
      slug: 'mountain-summit-tent',
      name: 'Mountain Summit Tent',
      description: '4-season, 4-person tent with aluminum poles and rainfly.',
      price: 459.99,
      comparePrice: 549.99,
      inventory: 15,
      category: 'Outdoor',
      tags: ['camping', 'tent', 'hiking'],
      images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80'],
    },
    {
      vendorId: northline.id,
      slug: 'expedition-65l-backpack',
      name: 'Expedition 65L Backpack',
      description: 'Waterproof pack with adjustable suspension for long trips.',
      price: 279.99,
      inventory: 20,
      category: 'Outdoor',
      tags: ['backpack', 'hiking', 'trekking'],
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
    },
    {
      vendorId: northline.id,
      slug: 'pro-climbing-rope',
      name: 'Pro Climbing Rope',
      description: 'Dynamic 10.5mm rope, 60m, UIAA certified and dry-treated.',
      price: 189.99,
      comparePrice: 229.99,
      inventory: 12,
      category: 'Outdoor',
      tags: ['climbing', 'safety', 'rope'],
      images: ['https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&q=80'],
    },
    {
      vendorId: northline.id,
      slug: 'tactical-multi-tool',
      name: 'Tactical Multi-Tool',
      description: '18-in-1 stainless steel tool with pliers, knife, and saw.',
      price: 89.99,
      inventory: 35,
      category: 'Outdoor',
      tags: ['multitool', 'survival', 'outdoor'],
      images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80'],
    },
    {
      vendorId: northline.id,
      slug: 'insulated-water-bottle-1l',
      name: 'Insulated Water Bottle 1L',
      description: 'Vacuum insulated steel bottle, hot 12 hours or cold 24 hours.',
      price: 39.99,
      comparePrice: 49.99,
      inventory: 50,
      category: 'Outdoor',
      tags: ['water bottle', 'insulated'],
      images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80'],
    },
  ]

  for (const product of catalog) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        vendorId: product.vendorId,
        name: product.name,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice ?? null,
        inventory: product.inventory,
        category: product.category,
        tags: product.tags,
        images: product.images,
        isActive: true,
      },
      create: product,
    })
  }

  const [vendorCount, productCount] = await Promise.all([
    prisma.vendor.count({ where: { isApproved: true, isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
  ])

  const now = new Date()
  const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const demoAds = [
    {
      vendorId: acme.id,
      slot: 'HOMEPAGE_BANNER' as const,
      title: 'Acme grid drop',
      headline: 'Wireless audio and everyday tech, live on MMall.',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1400&q=80',
      price: 1500,
    },
    {
      vendorId: harbor.id,
      slot: 'SEARCH_FEATURE' as const,
      title: 'Harbor Home edit',
      headline: 'Calm objects for daily living — featured in search.',
      imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=1400&q=80',
      price: 900,
    },
    {
      vendorId: northline.id,
      slot: 'SHOP_HIGHLIGHT' as const,
      title: 'Northline field kit',
      headline: 'Outdoor gear built for the long route.',
      imageUrl: 'https://images.unsplash.com/photo-1539085023575-5c9ad6c0f15a?w=1400&q=80',
      price: 600,
    },
  ]

  for (const ad of demoAds) {
    const existing = await prisma.adCampaign.findFirst({
      where: { vendorId: ad.vendorId, slot: ad.slot, title: ad.title },
    })
    const vendor = ad.vendorId === acme.id ? acme : ad.vendorId === harbor.id ? harbor : northline
    const data = {
      ...ad,
      linkUrl: `/(customer)/vendor/${vendor.slug}`,
      status: 'ACTIVE' as const,
      startsAt: now,
      endsAt: week,
    }
    if (existing) {
      await prisma.adCampaign.update({ where: { id: existing.id }, data })
    } else {
      await prisma.adCampaign.create({ data })
    }
  }

  for (const vendorId of [acme.id, harbor.id, northline.id]) {
    await prisma.vendorKyc.upsert({
      where: { vendorId },
      update: {
        approvedTier: 'ENTERPRISE',
        requestedTier: 'ENTERPRISE',
        status: 'APPROVED',
        legalName: 'Seeded merchant',
        selfieCaptured: true,
        reviewedAt: now,
      },
      create: {
        vendorId,
        approvedTier: 'ENTERPRISE',
        requestedTier: 'ENTERPRISE',
        status: 'APPROVED',
        legalName: 'Seeded merchant',
        selfieCaptured: true,
        reviewedAt: now,
      },
    })
  }

  console.log('Seeded marketplace:', {
    approvedVendors: vendorCount,
    products: productCount,
    admin: admin.email,
    acme: vendorUser.email,
    harbor: harborUser.email,
    northline: northlineUser.email,
    customer: customer.email,
    password: 'Password123!',
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
