import { useMemo } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { proximityLabel } from '@shopping-mall/shared-types'
import { loadVendor } from '../../../lib/catalog'
import { ProductCard } from '../../../components/product/ProductCard'
import { useAreaStore } from '../../../stores/areaStore'
import { MallChrome } from '../../../components/mall/MallChrome'
import { PageTitle } from '../../../components/mall/PageTitle'
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
    <View className="flex-1 bg-void">
      <MallChrome />
      <ScrollView className="flex-1" contentContainerClassName="pb-12">
      <PageTitle title={vendor.storeName} lede={here} />
      {vendor.description ? <Text className="text-mute px-4 -mt-1">{vendor.description}</Text> : null}
      <View className="flex-row flex-wrap px-2.5 mt-5">
        {items.map((product) => (
          <View key={product.id} className="w-1/2">
            <ProductCard product={product} showStore={false} />
          </View>
        ))}
      </View>
    </ScrollView>
    </View>
  )
}
