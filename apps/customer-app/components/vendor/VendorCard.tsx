import { Pressable, Text, View } from 'react-native'
import { Link } from 'expo-router'
import type { Vendor } from '@shopping-mall/shared-types'

export function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link href={`/(customer)/vendor/${vendor.slug}`} asChild>
      <Pressable className="bg-panel rounded-2xl p-4 mr-3 w-48">
        <View className="h-16 w-16 rounded-2xl bg-brand/20 items-center justify-center mb-3">
          <Text className="text-glow font-bold">{vendor.storeName.slice(0, 1)}</Text>
        </View>
        <Text className="font-semibold text-ice">{vendor.storeName}</Text>
        <Text className="text-sm text-mute" numberOfLines={2}>
          {vendor.description ?? 'Visit store'}
        </Text>
      </Pressable>
    </Link>
  )
}
