import { Image, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { Product } from '@shopping-mall/shared-types'
import { formatMoney } from '../../lib/utils/format'
import { productImage } from '../../lib/utils/images'

export function HeroDrop({ product }: { product: Product }) {
  return (
    <Pressable className="px-4" onPress={() => router.push(`/(customer)/product/${product.id}`)}>
      <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">In the window</Text>
      <Text className="text-2xl font-semibold text-ice mt-1 mb-4">Today on the floor</Text>
      <View className="overflow-hidden rounded-2xl">
        <Image source={{ uri: productImage(product.images?.[0]) }} className="w-full h-80 bg-navy" />
        <View className="absolute bottom-0 left-0 right-0 px-4 py-4 bg-black/45">
          <Text className="text-ice text-xl font-semibold" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="text-mute text-sm mt-1">{product.vendor?.storeName ?? 'MMall'}</Text>
          <Text className="text-glow text-lg mt-2">{formatMoney(product.price)}</Text>
        </View>
      </View>
    </Pressable>
  )
}
