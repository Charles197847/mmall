import { Image, Pressable, Text, View } from 'react-native'
import { Link } from 'expo-router'
import type { Product } from '@shopping-mall/shared-types'
import { formatMoney } from '../../lib/utils/format'
import { productImage } from '../../lib/utils/images'
import { storeHref } from '../../lib/navigation/store'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={storeHref(product)} asChild>
      <Pressable className="flex-1 m-2 bg-panel rounded-2xl overflow-hidden">
        <View className="h-36 bg-navy items-center justify-center">
          <Image source={{ uri: productImage(product.images?.[0]) }} className="w-full h-full" />
        </View>
        <View className="p-3">
          <Text className="font-semibold text-ice" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="text-sm text-mute" numberOfLines={1}>
            {product.vendor?.storeName ?? 'MMall'}
          </Text>
          <Text className="mt-1 font-bold text-glow">{formatMoney(product.price)}</Text>
        </View>
      </Pressable>
    </Link>
  )
}
