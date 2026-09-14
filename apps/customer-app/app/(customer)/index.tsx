import { Image, ScrollView, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { MallChrome } from '../../components/mall/MallChrome'
import { MallDirectory } from '../../components/mall/MallDirectory'
import { HeroDrop } from '../../components/mall/HeroDrop'
import { CourtNav } from '../../components/mall/CourtNav'
import { StoreRail } from '../../components/vendor/StoreRail'
import { ProductRail } from '../../components/product/ProductRail'
import { FilterBar } from '../../components/mall/FilterBar'
import { AdBand } from '../../components/mall/AdBand'
import { AdSlot } from '../../components/ads/AdSlot'
import { MallFooter } from '../../components/mall/MallFooter'
import { loadProducts, loadVendors, mockFeatured, mockProductsFor, mockVendors } from '../../lib/catalog'
import { mallCategories } from '../../lib/mallCategories'
import { mallSpecials } from '../../lib/mallOffers'
import { applyShopFilter } from '../../lib/shopFilters'
import { layout } from '../../lib/layout'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import { useFilterStore } from '../../stores/filterStore'
import { useAreaStore } from '../../stores/areaStore'

export default function HomeScreen() {
  const { user } = useAuth()
  const mode = useThemeStore((state) => state.mode)
  const paper = palettes[mode].void
  const filter = useFilterStore((state) => state.filter)
  const setFilter = useFilterStore((state) => state.setFilter)
  const area = useAreaStore((state) => state.place)
  const stores = useQuery({
    queryKey: ['vendors'],
    queryFn: () => loadVendors(),
    staleTime: 60_000,
  })
  const live = useQuery({
    queryKey: ['guest-featured'],
    queryFn: () => loadProducts({ page: 1, limit: 24 }),
    staleTime: 60_000,
  })

  const drop = mallSpecials()[0]
  const shops = [...(stores.data?.length ? stores.data : mockVendors())].filter(
    (shop, index, list) => list.findIndex((item) => item.slug === shop.slug) === index,
  )
  const featured = applyShopFilter(
    [...(live.data?.items ?? []), ...mockFeatured()].slice(0, 18),
    filter,
    area,
  )
  const visibleCategories = filter.category
    ? mallCategories.filter((item) => item.name === filter.category)
    : mallCategories

  function openBrowse(category?: string) {
    if (category) setFilter({ category })
    router.push(
      category
        ? (`/(customer)/browse?category=${encodeURIComponent(category)}` as never)
        : ('/(customer)/browse' as never),
    )
  }

  return (
    <View className="flex-1" style={{ backgroundColor: paper }}>
      <MallChrome />
      <ScrollView nestedScrollEnabled contentContainerClassName="pb-8">
        <View style={{ height: layout.heroBanner, overflow: 'hidden' }}>
          <Image
            source={require('../../assets/mmall-web-banner.png')}
            className="absolute inset-0 w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/40" />
          <View className="absolute left-4 right-4 bottom-4">
            <Text className="text-white" style={{ fontSize: 32, lineHeight: 34, fontWeight: '300' }}>
              Open.
            </Text>
            <Text className="text-white/80 mt-1 text-sm">
              {user ? `Welcome back, ${user.firstName}.` : 'The digital shopping mall.'}
            </Text>
          </View>
        </View>

        <CourtNav />
        <MallDirectory />
        {drop ? (
          <View className="mt-4">
            <HeroDrop product={drop} />
          </View>
        ) : null}

        <AdSlot slot="HOMEPAGE_BANNER" />

        <StoreRail vendors={shops} loading={stores.isLoading} onSeeAll={() => router.push('/(customer)/stores')} />
        <FilterBar />
        <ProductRail title="Featured" products={featured} onSeeAll={() => openBrowse()} />

        {visibleCategories.map((category, index) => (
          <View key={category.name}>
            <ProductRail
              title={category.name}
              products={applyShopFilter(mockProductsFor(category.name, 14), filter, area)}
              onSeeAll={() => openBrowse(category.name)}
            />
            {(index + 1) % 2 === 0 ? <AdBand label={`${category.name} promo`} /> : null}
          </View>
        ))}

        <MallFooter />
      </ScrollView>
    </View>
  )
}
