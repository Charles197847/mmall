import { FlatList, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { ProductCard } from '../../../components/product/ProductCard'
import { MallChrome } from '../../../components/mall/MallChrome'
import { useSavedStore } from '../../../stores/savedStore'
import { findMockProduct } from '../../../lib/catalog'
import type { Product } from '@shopping-mall/shared-types'

function asProduct(item: { id: string; name: string; price: number; image?: string; vendorName?: string }): Product {
  const live = findMockProduct(item.id)
  if (live) return live
  return {
    id: item.id,
    vendorId: 'saved',
    name: item.name,
    slug: item.id,
    description: '',
    price: item.price,
    comparePrice: null,
    inventory: 99,
    images: item.image ? [item.image] : [],
    category: null,
    tags: [],
    isActive: true,
    vendor: item.vendorName
      ? { id: 'saved', storeName: item.vendorName, slug: 'saved', logo: null }
      : undefined,
  }
}

export default function SavedScreen() {
  const items = useSavedStore((state) => state.items)

  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="p-2"
        ListHeaderComponent={
          <View className="px-2 py-3">
            <Text className="text-2xl font-bold text-ice">Saved</Text>
            <Text className="text-mute mt-1">Loved listings stay on this phone.</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="px-4 pt-8">
            <Text className="text-ice font-semibold">Nothing saved yet.</Text>
            <Text className="text-mute mt-2">Tap the heart on a product to keep it here.</Text>
            <Pressable className="mt-4 bg-brand rounded-2xl py-3" onPress={() => router.push('/(customer)/browse')}>
              <Text className="text-white text-center font-bold">Browse the mall</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View className="w-1/2">
            <ProductCard product={asProduct(item)} />
          </View>
        )}
      />
    </View>
  )
}
