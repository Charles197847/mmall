import { Image, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { proximityLabel } from '@shopping-mall/shared-types'
import type { Vendor } from '@shopping-mall/shared-types'
import { useAreaStore } from '../../stores/areaStore'
import { productImage } from '../../lib/utils/images'

export function StoreWindow({ vendor }: { vendor: Vendor }) {
  const area = useAreaStore((state) => state.place)
  const photo = vendor.coverImage || vendor.logo

  return (
    <Pressable className="mb-5" onPress={() => router.push(`/(customer)/vendor/${vendor.slug}`)}>
      <Image source={{ uri: productImage(photo) }} className="w-full h-52 bg-navy" resizeMode="cover" />
      <View className="px-4 pt-3 flex-row items-center">
        {vendor.logo ? (
          <Image source={{ uri: vendor.logo }} className="w-11 h-11 rounded-full bg-navy" />
        ) : (
          <View className="w-11 h-11 rounded-full bg-brand/20 items-center justify-center">
            <Text className="text-glow font-bold">{vendor.storeName[0]}</Text>
          </View>
        )}
        <View className="flex-1 ml-3">
          <Text className="text-ice text-lg font-semibold">{vendor.storeName}</Text>
          <Text className="text-glow text-xs mt-0.5">
            {proximityLabel(area, vendor.city, vendor.lat, vendor.lng) ?? vendor.city ?? 'South Africa'}
          </Text>
        </View>
        <Text className="text-mute text-sm">Enter</Text>
      </View>
    </Pressable>
  )
}
