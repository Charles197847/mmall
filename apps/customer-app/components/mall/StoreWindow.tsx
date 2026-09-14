import { Image, Text, View } from 'react-native'
import { router } from 'expo-router'
import { proximityLabel } from '@shopping-mall/shared-types'
import type { Vendor } from '@shopping-mall/shared-types'
import { useAreaStore } from '../../stores/areaStore'
import { productImage } from '../../lib/utils/images'
import { PressScale } from '../ui/PressScale'

export function StoreWindow({ vendor }: { vendor: Vendor }) {
  const area = useAreaStore((state) => state.place)
  const photo = vendor.coverImage || vendor.logo
  const here = proximityLabel(area, vendor.city, vendor.lat, vendor.lng) ?? vendor.city ?? 'South Africa'

  return (
    <View className="mb-6 px-5">
      <PressScale
        onPress={() => router.push(`/(customer)/vendor/${vendor.slug}`)}
        accessibilityRole="button"
        accessibilityLabel={`${vendor.storeName}, ${here}`}
      >
        <View className="overflow-hidden bg-navy" style={{ height: 248, borderRadius: 28 }}>
          <Image source={{ uri: productImage(photo) }} className="absolute inset-0 w-full h-full" resizeMode="cover" />
          <View className="absolute inset-0 bg-black/25" />
          <View className="absolute bottom-5 left-5 right-5 flex-row items-end justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-white" style={{ fontSize: 26, fontWeight: '300' }}>
                {vendor.storeName}
              </Text>
              <Text className="text-white/70 text-sm mt-1">{here}</Text>
            </View>
            <Text className="text-white/80 text-sm mb-1">Enter</Text>
          </View>
        </View>
      </PressScale>
    </View>
  )
}
