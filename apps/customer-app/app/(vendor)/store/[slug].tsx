import { FlatList, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { ProductCard } from '../../../components/product/ProductCard'

export default function StoreScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => api.vendors.getBySlug(slug),
    enabled: Boolean(slug),
  })

  if (isLoading || !vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-void">
        <Text className="text-ice">{isLoading ? 'Loading store...' : 'Store not found'}</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-void">
      <View className="p-4 bg-navy">
        <Text className="text-2xl font-bold text-ice">{vendor.storeName}</Text>
        <Text className="text-mute mt-1">{vendor.description}</Text>
      </View>
      <FlatList
        data={vendor.products ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <ProductCard product={item} />}
      />
    </View>
  )
}
