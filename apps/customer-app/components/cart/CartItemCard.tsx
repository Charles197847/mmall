import { Pressable, Text, View } from 'react-native'
import type { CartItem } from '@shopping-mall/shared-types'
import { useCartStore } from '../../stores/cartStore'
import { formatMoney } from '../../lib/utils/format'

export function CartItemCard({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <View className="flex-row justify-between items-center py-3">
      <View className="flex-1 pr-3">
        <Text className="font-medium text-ice">{item.name}</Text>
        <Text className="text-mute">{formatMoney(item.price)}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          className="w-8 h-8 rounded-lg bg-navy items-center justify-center"
          onPress={() => updateQuantity(item.productId, item.quantity - 1)}
        >
          <Text className="text-ice">-</Text>
        </Pressable>
        <Text className="text-ice">{item.quantity}</Text>
        <Pressable
          className="w-8 h-8 rounded-lg bg-navy items-center justify-center"
          onPress={() => updateQuantity(item.productId, item.quantity + 1)}
        >
          <Text className="text-ice">+</Text>
        </Pressable>
        <Pressable onPress={() => removeItem(item.productId)}>
          <Text className="text-signal ml-2">Remove</Text>
        </Pressable>
      </View>
    </View>
  )
}
