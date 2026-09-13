import { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import { Link } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import type { Product } from '@shopping-mall/shared-types'
import { formatMoney } from '../../lib/utils/format'
import { PLACEHOLDER_IMAGE, productImage } from '../../lib/utils/images'
import { storeHref } from '../../lib/navigation/store'
import { PressScale } from '../ui/PressScale'

const RAIL_SIZE = 160
const GRID_IMAGE_HEIGHT = 144

export function ProductCard({
  product,
  variant = 'grid',
}: {
  product: Product
  variant?: 'grid' | 'rail'
}) {
  const rail = variant === 'rail'
  const source = productImage(product.images?.[0])
  const [uri, setUri] = useState(source)

  useEffect(() => {
    setUri(source)
  }, [source])

  return (
    <Animated.View entering={FadeIn.duration(280)}>
    <Link href={storeHref(product)} asChild>
      <PressScale
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formatMoney(product.price)}, ${product.vendor?.storeName ?? 'MMall'}`}
        className={rail ? 'mr-3 bg-panel rounded-2xl overflow-hidden' : 'flex-1 m-2 bg-panel rounded-2xl overflow-hidden'}
        style={rail ? { width: RAIL_SIZE } : undefined}
      >
        <Image
          source={{ uri }}
          accessibilityLabel={product.name}
          className="bg-navy"
          style={rail ? { width: RAIL_SIZE, height: RAIL_SIZE } : { width: '100%', height: GRID_IMAGE_HEIGHT }}
          resizeMode="cover"
          onError={() => {
            if (uri !== PLACEHOLDER_IMAGE) setUri(PLACEHOLDER_IMAGE)
          }}
        />
        <View className="p-3">
          <Text className="font-semibold text-ice" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="text-sm text-mute" numberOfLines={1}>
            {product.vendor?.storeName ?? 'MMall'}
          </Text>
          <Text className="mt-1 font-bold text-glow">{formatMoney(product.price)}</Text>
        </View>
      </PressScale>
    </Link>
    </Animated.View>
  )
}
