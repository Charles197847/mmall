import { FlatList, Text, TouchableOpacity, View } from 'react-native'
import type { Product } from '@shopping-mall/shared-types'
import { ProductCard } from './ProductCard'

/** Rail card is 160px wide plus the `mr-3` gap. Used so the horizontal list windows instead of mounting every image. */
const RAIL_STRIDE = 172
const RAIL_PAD = 16

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
          <TouchableOpacity onPress={onSeeAll} hitSlop={8} style={{ minHeight: 44, justifyContent: 'center' }}>
            <Text className="text-sm font-semibold text-glow">{seeAllLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <Text className="px-4 text-mute">Loading catalog…</Text>
      ) : (
        <FlatList
          horizontal
          data={products}
          keyExtractor={(product) => product.id}
          renderItem={({ item }) => <ProductCard product={item} variant="rail" />}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingLeft: RAIL_PAD, paddingRight: RAIL_PAD, paddingBottom: 4 }}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={2}
          removeClippedSubviews
          getItemLayout={(_, index) => ({
            length: RAIL_STRIDE,
            offset: RAIL_PAD + RAIL_STRIDE * index,
            index,
          })}
        />
      )}
    </View>
  )
}
