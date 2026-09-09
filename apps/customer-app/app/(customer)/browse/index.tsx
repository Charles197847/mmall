import { useEffect, useState } from 'react'
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ProductCard } from '../../../components/product/ProductCard'
import { AdSlot } from '../../../components/ads/AdSlot'
import { api } from '../../../lib/api'
import { mmall } from '../../../lib/theme'

const categories = ['Electronics', 'Fashion', 'Home', 'Books', 'Beauty', 'Sports']

export default function BrowseScreen() {
  const params = useLocalSearchParams<{ category?: string }>()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(params.category ?? '')

  useEffect(() => {
    if (typeof params.category === 'string') {
      setCategory(params.category)
    }
  }, [params.category])

  const { data, isLoading } = useQuery({
    queryKey: ['products', search, category],
    queryFn: () => api.products.list({ q: search, category }),
    staleTime: 60_000,
  })

  return (
    <View className="flex-1 bg-void">
      <View className="p-4 bg-navy">
        <TextInput
          className="bg-panel rounded-2xl px-4 py-3 text-ice"
          placeholder="Search products..."
          placeholderTextColor={mmall.mute}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2 max-h-14"
        data={categories}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`px-4 py-2 mr-2 rounded-full ${category === item ? 'bg-brand' : 'bg-panel'}`}
            onPress={() => setCategory(category === item ? '' : item)}
          >
            <Text className={category === item ? 'text-white' : 'text-mute'}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <AdSlot slot="SEARCH_FEATURE" />

      {isLoading ? (
        <Text className="p-4 text-mute">Loading products...</Text>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => <ProductCard product={item} />}
          contentContainerClassName="p-2"
          ListEmptyComponent={<Text className="p-4 text-mute">No products match this search.</Text>}
        />
      )}
    </View>
  )
}
