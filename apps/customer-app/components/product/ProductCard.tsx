import { useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import { Link } from 'expo-router'
import type { Product } from '@shopping-mall/shared-types'
import { formatMoney } from '../../lib/utils/format'
import { PLACEHOLDER_IMAGE, productImage } from '../../lib/utils/images'
import { storeHref } from '../../lib/navigation/store'
import { layout } from '../../lib/layout'
import { PressScale } from '../ui/PressScale'
import { LoveButton } from './LoveButton'

const RAIL_SIZE = 160

export function ProductCard({
  product,
  variant = 'grid',
  showStore = true,
}: {
  product: Product
  variant?: 'grid' | 'rail'
  showStore?: boolean
}) {
  const rail = variant === 'rail'
  const source = productImage(product.images?.[0])
  const [uri, setUri] = useState(source)

  useEffect(() => {
    setUri(source)
  }, [source])

  return (
    <View className={rail ? 'relative mr-3' : 'relative flex-1 px-1.5 mb-4'}>
      <Link href={storeHref(product)} asChild>
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={`${product.name}, ${formatMoney(product.price)}, ${product.vendor?.storeName ?? 'MMall'}`}
          style={rail ? { width: RAIL_SIZE } : undefined}
        >
          <Image
            source={{ uri }}
            accessibilityLabel={product.name}
            className="bg-navy rounded-[18px]"
            style={rail ? { width: RAIL_SIZE, height: 176 } : { width: '100%', height: layout.productImage }}
            resizeMode="cover"
            onError={() => {
              if (uri !== PLACEHOLDER_IMAGE) setUri(PLACEHOLDER_IMAGE)
            }}
          />
          <View className="pt-2.5">
            <Text className="font-medium text-ice text-[14px] leading-5" numberOfLines={2}>
              {product.name}
            </Text>
            {showStore ? (
              <Text className="text-xs text-mute mt-0.5" numberOfLines={1}>
                {product.vendor?.storeName ?? 'MMall'}
              </Text>
            ) : null}
            <Text className="mt-1 text-sm font-semibold text-ice">
              {formatMoney(product.price)}
              {product.comparePrice && product.comparePrice > product.price ? (
                <Text className="text-mute text-xs font-normal line-through"> {formatMoney(product.comparePrice)}</Text>
              ) : null}
            </Text>
          </View>
        </PressScale>
      </Link>
      <LoveButton product={product} />
    </View>
  )
}
