import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { proximityScore } from '@shopping-mall/shared-types'
import { loadVendors } from '../../../lib/catalog'
import { useAreaStore } from '../../../stores/areaStore'
import { StoreWindow } from '../../../components/mall/StoreWindow'
import { DeliverTo } from '../../../components/mall/DeliverTo'
import { mmall } from '../../../lib/theme'

export default function StoresScreen() {
  const area = useAreaStore((state) => state.place)
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => loadVendors(),
    staleTime: 60_000,
  })

  const shops = [...(vendors ?? [])].sort(
    (a, b) =>
      proximityScore(area, a.city, a.lat, a.lng) - proximityScore(area, b.city, b.lat, b.lng),
  )

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-void">
        <ActivityIndicator size="large" color={mmall.glow} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-void">
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoreWindow vendor={item} />}
        ListHeaderComponent={
          <View className="px-4 pt-14 pb-6">
            <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Directory</Text>
            <Text className="text-3xl font-semibold text-ice mt-1">Shops</Text>
            <Text className="text-mute mt-2 mb-4">
              {area ? `Nearest windows to ${area.city}` : 'Independent stores on the grid'}
            </Text>
            <DeliverTo />
          </View>
        }
      />
    </View>
  )
}
