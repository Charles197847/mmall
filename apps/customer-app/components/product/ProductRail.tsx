import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import type { Product } from '@shopping-mall/shared-types'
import { ProductCard } from './ProductCard'

export function ProductRail({
  title,
  subtitle,
  products,
  loading,
  onSeeAll,
  seeAllLabel = 'See all',
}: {
  title: string
  subtitle?: string
  products: Product[]
  loading?: boolean
  onSeeAll?: () => void
  seeAllLabel?: string
}) {
  if (!loading && products.length === 0) return null

  return (
    <View className="mb-6">
      <View className="px-4 mb-3 flex-row justify-between items-end">
        <View className="flex-1 pr-3">
          <Text className="text-xl font-semibold text-ice">{title}</Text>
          {subtitle ? <Text className="text-mute text-sm mt-0.5">{subtitle}</Text> : null}
        </View>
        {onSeeAll ? (
          <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
            <Text className="text-sm font-semibold text-glow">{seeAllLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Text className="px-4 text-mute">Loading catalog…</Text>
      ) : (
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerClassName="px-4 pb-1"
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="rail" />
          ))}
        </ScrollView>
      )}
    </View>
  )
}
