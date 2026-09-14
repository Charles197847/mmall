import { Pressable, Text, View } from 'react-native'
import type { BagItem } from '../../stores/cartStore'
import { useCartStore } from '../../stores/cartStore'
import { formatMoney } from '../../lib/utils/format'

export function CartItemCard({ item }: { item: BagItem }) {
  const { updateQuantity, removeItem } = useCartStore()

  return (
    <View className="flex-row justify-between items-center py-3">
      <View className="flex-1 pr-3">
        <Text className="font-medium text-ice">{item.name}</Text>
        {item.options && Object.keys(item.options).length ? (
          <Text className="text-xs text-mute mt-0.5">
            {Object.entries(item.options)
              .map(([key, value]) => `${key} ${value}`)
              .join(' · ')}
          </Text>
        ) : null}
        <Text className="text-mute">{formatMoney(item.price)}</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          className="w-8 h-8 rounded-lg bg-navy items-center justify-center"
          onPress={() => updateQuantity(item.lineKey, item.quantity - 1)}
        >
          <Text className="text-ice">-</Text>
        </Pressable>
        <Text className="text-ice">{item.quantity}</Text>
        <Pressable
          className="w-8 h-8 rounded-lg bg-navy items-center justify-center"
          onPress={() => updateQuantity(item.lineKey, item.quantity + 1)}
        >
          <Text className="text-ice">+</Text>
        </Pressable>
        <Pressable onPress={() => removeItem(item.lineKey)}>
          <Text className="text-signal ml-2">Remove</Text>
        </Pressable>
      </View>
    </View>
  )
}
