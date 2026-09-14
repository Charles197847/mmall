import { Image, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { Product } from '@shopping-mall/shared-types'
import { formatMoney } from '../../lib/utils/format'
import { productImage } from '../../lib/utils/images'
import { PressScale } from '../ui/PressScale'
import { SectionHead } from './SectionHead'

export function HeroDrop({ product, showHeading = true }: { product: Product; showHeading?: boolean }) {
  return (
    <View>
      {showHeading ? <SectionHead kicker="On the floor" title="One object" /> : null}
      <View className="px-5">
        <PressScale
          onPress={() => router.push(`/(customer)/product/${product.id}`)}
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${formatMoney(product.price)}`}
        >
          <View className="overflow-hidden bg-navy" style={{ borderRadius: 28 }}>
            <Image source={{ uri: productImage(product.images?.[0]) }} className="w-full" style={{ height: 360 }} />
          </View>
          <Text className="text-ice mt-4" numberOfLines={2} style={{ fontSize: 26, fontWeight: '300' }}>
            {product.name}
          </Text>
          <Text className="text-mute text-sm mt-1">
            {product.vendor?.storeName ?? 'MMall'} · {formatMoney(product.price)}
          </Text>
        </PressScale>
      </View>
    </View>
  )
}
