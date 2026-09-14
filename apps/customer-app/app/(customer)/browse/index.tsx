import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '../../../components/product/ProductCard'
import { MallDirectory } from '../../../components/mall/MallDirectory'
import { HeroDrop } from '../../../components/mall/HeroDrop'
import { CourtNav } from '../../../components/mall/CourtNav'
import { StoreWindow } from '../../../components/mall/StoreWindow'
import { AdSlot } from '../../../components/ads/AdSlot'
import { MallChrome } from '../../../components/mall/MallChrome'
import { FilterBar } from '../../../components/mall/FilterBar'
import { PageTitle } from '../../../components/mall/PageTitle'
import { loadProducts, loadVendors, mockFeatured, mockProductsFor, productMatchesQuery } from '../../../lib/catalog'
import { courtById, courtForCategory, mallCourts } from '../../../lib/courts'
import { applyShopFilter } from '../../../lib/shopFilters'
import { productGrid } from '../../../lib/layout'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'
import { useFilterStore } from '../../../stores/filterStore'
import { useAreaStore } from '../../../stores/areaStore'

export default function BrowseScreen() {
  const params = useLocalSearchParams<{ category?: string; court?: string; q?: string }>()
  const [search, setSearch] = useState(typeof params.q === 'string' ? params.q : '')
  const colors = palettes[useThemeStore((state) => state.mode)]
  const filter = useFilterStore((state) => state.filter)
  const setFilter = useFilterStore((state) => state.setFilter)
  const area = useAreaStore((state) => state.place)
  const court = courtById(params.court) ?? courtForCategory(params.category ?? filter.category)
  const category = params.category ?? (filter.category || court?.categories[0])
  const query = search.trim()
  const mallWide = Boolean(query) && !court && !params.category && !filter.category

  useEffect(() => {
    if (typeof params.q === 'string') setSearch(params.q)
  }, [params.q])

  useEffect(() => {
    if (params.category && params.category !== filter.category) {
      setFilter({ category: params.category })
    }
  }, [params.category, filter.category, setFilter])

  const productsQuery = useQuery({
    queryKey: ['court-products', category, query, mallWide],
    queryFn: () =>
      loadProducts({
        category: mallWide ? undefined : category,
        q: query || undefined,
        limit: 48,
      }),
    enabled: Boolean(category) || mallWide || Boolean(filter.category),
    staleTime: 60_000,
  })

  const vendorsQuery = useQuery({
    queryKey: ['vendors'],
    queryFn: () => loadVendors(),
    staleTime: 60_000,
  })

  const items = useMemo(() => {
    const live = (productsQuery.data?.items ?? []).filter((item) => (query ? productMatchesQuery(item, query) : true))
    let pool = live
    if (!pool.length) {
      if (mallWide) pool = mockFeatured().filter((item) => productMatchesQuery(item, query))
      else if (category) {
        const mock = court
          ? court.categories.flatMap((name) => mockProductsFor(name, 8))
          : mockProductsFor(category, 16)
        pool = query ? mock.filter((item) => productMatchesQuery(item, query)) : mock
      }
    }
    return applyShopFilter(pool, filter, area)
  }, [productsQuery.data, category, court, query, mallWide, filter, area])

  const shops = useMemo(() => {
    if (!mallWide) return []
    const needle = query.toLowerCase()
    return (vendorsQuery.data ?? []).filter(
      (vendor) =>
        vendor.storeName.toLowerCase().includes(needle) ||
        vendor.city?.toLowerCase().includes(needle) ||
        vendor.description?.toLowerCase().includes(needle),
    )
  }, [mallWide, query, vendorsQuery.data])

  const courts = useMemo(() => {
    if (!mallWide) return []
    const needle = query.toLowerCase()
    return mallCourts.filter(
      (row) =>
        row.name.toLowerCase().includes(needle) ||
        row.line.toLowerCase().includes(needle) ||
        row.categories.some((name) => name.toLowerCase().includes(needle)),
    )
  }, [mallWide, query])

  const hero = items[0]
  const rest = items.slice(1)
  const searching = mallWide && productsQuery.isLoading && !productsQuery.data
  const noMatch = !searching && !items.length && !shops.length && !courts.length
  const directoryOnly = !court && !params.category && !mallWide && !filter.category
  const title = query ? `Results for “${query}”` : filter.category || court?.name || 'Browse'

  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <FlatList
        data={directoryOnly ? [] : rest}
        keyExtractor={(item) => item.id}
        numColumns={productGrid.numColumns}
        columnWrapperStyle={directoryOnly ? undefined : productGrid.columnWrapperStyle}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerClassName="pb-10"
        ListHeaderComponent={
          <View>
            {court?.cover ? <Image source={{ uri: court.cover }} className="w-full h-44 bg-navy" /> : null}
            <CourtNav />
            <PageTitle kicker={court?.level ?? 'Mall'} title={title} lede={court?.line} />
            <FilterBar />
            <AdSlot slot="SEARCH_FEATURE" />
            {directoryOnly ? <MallDirectory variant="index" /> : null}
            {courts.length ? (
              <View className="px-4 mb-5">
                <Text className="text-mute text-sm mb-2">Courts</Text>
                {courts.map((row) => (
                  <Pressable
                    key={row.id}
                    className="py-2.5"
                    onPress={() => router.push(`/(customer)/browse?court=${row.id}` as never)}
                  >
                    <Text className="text-ice" style={{ fontSize: 20, fontWeight: '300' }}>
                      {row.name}
                    </Text>
                    <Text className="text-mute">{row.line}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {shops.length ? (
              <View className="mb-5">
                <Text className="px-4 text-mute text-sm mb-2">Shops</Text>
                {shops.slice(0, 6).map((vendor) => (
                  <StoreWindow key={vendor.id} vendor={vendor} />
                ))}
              </View>
            ) : null}
            {searching ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color={colors.glow} />
              </View>
            ) : null}
            {hero && !directoryOnly ? (
              <View className="mt-1 mb-4">
                <HeroDrop product={hero} showHeading={false} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          directoryOnly || searching ? null : noMatch ? (
            <Text className="px-4 text-mute">Nothing matches that search.</Text>
          ) : null
        }
      />
    </View>
  )
}
