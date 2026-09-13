import { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import { Link } from 'expo-router'
import type { Product } from '@shopping-mall/shared-types'
import { formatMoney } from '../../lib/utils/format'
import { PLACEHOLDER_IMAGE, productImage } from '../../lib/utils/images'
import { storeHref } from '../../lib/navigation/store'
import { PressScale } from '../ui/PressScale'
import { LoveButton } from './LoveButton'

const RAIL_SIZE = 176

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
    <View className={rail ? 'mr-4' : 'flex-1 px-1.5 mb-6'}>
      <Link href={storeHref(product)} asChild>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${formatMoney(product.price)}, ${product.vendor?.storeName ?? 'MMall'}`}
          style={rail ? { width: RAIL_SIZE } : undefined}
        >
          <Image
            source={{ uri }}
            accessibilityLabel={product.name}
            className="bg-navy rounded-xl"
            style={rail ? { width: RAIL_SIZE, height: 160 } : { width: '100%', height: 160 }}
            resizeMode="cover"
            onError={() => {
              if (uri !== PLACEHOLDER_IMAGE) setUri(PLACEHOLDER_IMAGE)
            }}
          />
          <View className="pt-2.5">
            <Text className="font-semibold text-ice text-sm" numberOfLines={2}>
              {product.name}
            </Text>
            <Text className="text-xs text-mute mt-1" numberOfLines={1}>
              {product.vendor?.storeName ?? 'MMall'}
            </Text>
            <Text className="mt-1.5 text-sm text-glow">
              {formatMoney(product.price)}
              {product.comparePrice && product.comparePrice > product.price ? (
                <Text className="text-mute text-xs line-through"> {formatMoney(product.comparePrice)}</Text>
              ) : null}
            </Text>
          </View>
        </PressScale>
      </Link>
      <LoveButton product={product} />
    </View>
  )
}
