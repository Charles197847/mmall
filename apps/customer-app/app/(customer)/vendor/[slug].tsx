import { useMemo } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { proximityLabel } from '@shopping-mall/shared-types'
import { loadVendor } from '../../../lib/catalog'
import { ProductCard } from '../../../components/product/ProductCard'
import { useAreaStore } from '../../../stores/areaStore'
import { MallChrome } from '../../../components/mall/MallChrome'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function VendorStoreScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const area = useAreaStore((state) => state.place)
  const colors = palettes[useThemeStore((state) => state.mode)]

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => loadVendor(slug!),
    enabled: Boolean(slug),
  })

  const items = useMemo(() => vendor?.products ?? [], [vendor])
  const here = proximityLabel(area, vendor?.city, vendor?.lat, vendor?.lng) ?? vendor?.city ?? 'South Africa'

  if (isLoading || !vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-void">
        {isLoading ? <ActivityIndicator size="large" color={colors.glow} /> : <Text className="text-ice">Store not found</Text>}
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-void" contentContainerClassName="pb-12">
      <MallChrome />
      <View className="px-5">
        <Text className="text-ice" style={{ fontSize: 34, lineHeight: 40, fontWeight: '300' }}>
          {vendor.storeName}
        </Text>
        <Text className="text-mute text-sm mt-2">{here}</Text>
        {vendor.description ? <Text className="text-mute mt-3 max-w-xl">{vendor.description}</Text> : null}
      </View>
      <View className="flex-row flex-wrap px-3.5 mt-8">
        {items.map((product) => (
          <View key={product.id} className="w-1/2">
            <ProductCard product={product} showStore={false} />
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
