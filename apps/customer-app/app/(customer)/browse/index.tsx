import { useMemo, useState } from 'react'
import { FlatList, Image, Pressable, Text, TextInput, View } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '../../../components/product/ProductCard'
import { MallDirectory } from '../../../components/mall/MallDirectory'
import { HeroDrop } from '../../../components/mall/HeroDrop'
import { loadProducts, mockProductsFor } from '../../../lib/catalog'
import { courtById, courtForCategory } from '../../../lib/courts'
import { mmall } from '../../../lib/theme'

export default function BrowseScreen() {
  const params = useLocalSearchParams<{ category?: string; court?: string; q?: string }>()
  const [search, setSearch] = useState('')
  const court = courtById(params.court) ?? courtForCategory(params.category)
  const category = params.category ?? court?.categories[0]

  const { data } = useQuery({
    queryKey: ['court-products', category, search],
    queryFn: () => loadProducts({ category, q: search.trim() || undefined, limit: 32 }),
    enabled: Boolean(category),
    staleTime: 60_000,
  })

  const items = useMemo(() => {
    const live = data?.items ?? []
    if (live.length) return live
    if (!category) return []
    const mock = court
      ? court.categories.flatMap((name) => mockProductsFor(name, 8))
      : mockProductsFor(category, 16)
    if (!search.trim()) return mock
    const q = search.trim().toLowerCase()
    return mock.filter((item) => item.name.toLowerCase().includes(q))
  }, [data, category, court, search])

  const hero = items[0]
  const rest = items.slice(1)

  if (!court && !params.category && !params.q) {
    return (
      <FlatList
        className="flex-1 bg-void"
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <View className="pt-14 pb-10">
            <View className="px-4 mb-6">
              <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Courts</Text>
              <Text className="text-3xl font-semibold text-ice mt-1">Choose a floor</Text>
            </View>
            <MallDirectory />
          </View>
        }
      />
    )
  }

  return (
    <View className="flex-1 bg-void">
      <FlatList
        data={rest}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerClassName="pb-10"
        ListHeaderComponent={
          <View>
            {court?.cover ? <Image source={{ uri: court.cover }} className="w-full h-44 bg-navy" /> : null}
            <View className="px-4 pt-5">
              <Pressable onPress={() => router.replace('/(customer)/browse')}>
                <Text className="text-mute text-sm">All courts</Text>
              </Pressable>
              <Text className="text-[11px] tracking-[0.28em] text-glow uppercase mt-3">{court?.level ?? 'Mall'}</Text>
              <Text className="text-3xl font-semibold text-ice mt-1">{court?.name ?? category}</Text>
              {court ? <Text className="text-mute mt-1">{court.line}</Text> : null}
              <TextInput
                className="mt-4 border-b border-panel pb-2 text-ice"
                placeholder="Search this court"
                placeholderTextColor={mmall.mute}
                value={search}
                onChangeText={setSearch}
              />
            </View>
            {hero ? (
              <View className="mt-8 mb-6">
                <HeroDrop product={hero} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={<Text className="px-4 text-mute">This court is quiet right now.</Text>}
      />
    </View>
  )
}
