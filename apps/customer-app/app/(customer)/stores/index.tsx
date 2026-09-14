import { ActivityIndicator, FlatList, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { proximityScore } from '@shopping-mall/shared-types'
import { loadVendors } from '../../../lib/catalog'
import { useAreaStore } from '../../../stores/areaStore'
import { StoreWindow } from '../../../components/mall/StoreWindow'
import { SectionHead } from '../../../components/mall/SectionHead'
import { CourtNav } from '../../../components/mall/CourtNav'
import { MallChrome } from '../../../components/mall/MallChrome'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function StoresScreen() {
  const area = useAreaStore((state) => state.place)
  const mode = useThemeStore((state) => state.mode)
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
        <ActivityIndicator size="large" color={palettes[mode].glow} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StoreWindow vendor={item} />}
        ListHeaderComponent={
          <View className="pb-4">
            <CourtNav />
            <SectionHead
              kicker={area ? `Near ${area.city}` : 'The concourse'}
              title="Shops"
            />
          </View>
        }
      />
    </View>
  )
}
