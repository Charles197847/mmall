import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { proximityLabel, proximityScore } from '@shopping-mall/shared-types'
import type { Vendor } from '@shopping-mall/shared-types'
import { useAreaStore } from '../../stores/areaStore'

export function StoreRail({
  title = 'Stores',
  subtitle,
  vendors,
  loading,
  onSeeAll,
}: {
  title?: string
  subtitle?: string
  vendors: Vendor[]
  loading?: boolean
  onSeeAll?: () => void
}) {
  const area = useAreaStore((state) => state.place)
  const shops = [...vendors].sort(
    (a, b) =>
      proximityScore(area, a.city, a.lat, a.lng) - proximityScore(area, b.city, b.lat, b.lng),
  )

  if (!loading && shops.length === 0) return null

  return (
    <View className="mb-10">
      <View className="px-4 mb-3 flex-row justify-between items-end">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-semibold text-ice">{title}</Text>
          <Text className="text-mute text-sm mt-0.5">
            {subtitle ?? (area ? `Nearest to ${area.city} first` : 'Visit a branded shop')}
          </Text>
        </View>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
            <Text className="text-sm font-semibold text-glow">See all</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Text className="px-4 text-mute">Loading stores…</Text>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerClassName="px-4 pb-1"
        >
          {shops.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              className="w-56 mr-4"
              onPress={() => router.push(`/(customer)/vendor/${vendor.slug}`)}
            >
              {vendor.logo ? (
                <Image source={{ uri: vendor.logo }} className="w-12 h-12 rounded-full bg-navy mb-3" />
              ) : (
                <View className="w-12 h-12 rounded-full bg-brand/20 items-center justify-center mb-3">
                  <Text className="font-bold text-glow">{vendor.storeName[0]}</Text>
                </View>
              )}
              <Text className="font-semibold text-ice" numberOfLines={1}>
                {vendor.storeName}
              </Text>
              <Text className="mt-1 text-xs text-glow">
                {proximityLabel(area, vendor.city, vendor.lat, vendor.lng) ?? 'South Africa'}
              </Text>
              <Text className="mt-1 text-xs text-mute" numberOfLines={2}>
                {vendor.description || 'Independent store'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
