import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import type { Vendor } from '@shopping-mall/shared-types'

export function StoreRail({
  title,
  subtitle,
  vendors,
  loading,
  onSeeAll,
}: {
  title: string
  subtitle?: string
  vendors: Vendor[]
  loading?: boolean
  onSeeAll?: () => void
}) {
  if (!loading && vendors.length === 0) return null

  return (
    <View className="mt-6">
      <View className="px-4 mb-3 flex-row justify-between items-end">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-bold text-ice">{title}</Text>
          {subtitle ? <Text className="text-mute text-sm mt-0.5">{subtitle}</Text> : null}
        </View>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
            <Text className="text-glow font-semibold">See all</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Text className="px-4 text-mute">Loading stores...</Text>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerClassName="px-4 pb-1"
        >
          {vendors.map((vendor) => (
            <TouchableOpacity
              key={vendor.id}
              className="w-36 mr-3 bg-panel rounded-2xl p-3"
              onPress={() => router.push(`/(customer)/vendor/${vendor.slug}`)}
            >
              {vendor.logo ? (
                <Image
                  source={{ uri: vendor.logo }}
                  className="w-16 h-16 rounded-2xl bg-navy"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-16 h-16 rounded-2xl bg-brand/20 items-center justify-center">
                  <Text className="text-xl font-bold text-glow">{vendor.storeName[0]}</Text>
                </View>
              )}
              <Text className="font-semibold text-ice mt-2" numberOfLines={1}>
                {vendor.storeName}
              </Text>
              <Text className="text-xs text-mute mt-1" numberOfLines={2}>
                {vendor.description ?? 'Visit store'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )
}
