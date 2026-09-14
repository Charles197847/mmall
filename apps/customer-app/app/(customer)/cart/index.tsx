import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useCartStore } from '../../../stores/cartStore'
import { productImage } from '../../../lib/utils/images'
import { mmall } from '../../../lib/theme'

export default function CartScreen() {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const getItemsByVendor = useCartStore((s) => s.getItemsByVendor)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const clearCart = useCartStore((s) => s.clearCart)

  const vendorGroups = Array.from(getItemsByVendor().entries())

  if (items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-void">
        <Feather name="shopping-bag" size={64} color={mmall.mute} />
        <Text className="text-lg text-mute mt-4">Your bag is empty</Text>
        <TouchableOpacity
          onPress={() => router.push('/(customer)/browse')}
          className="mt-4 bg-brand px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-semibold">Start shopping</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-void">
      <FlatList
        data={vendorGroups}
        keyExtractor={([vendorId]) => vendorId}
        contentContainerClassName="p-4 pb-36"
        renderItem={({ item: [, vendorItems] }) => (
          <View className="bg-panel rounded-2xl p-4 mb-4">
            <Text className="font-bold text-lg mb-3 text-ice">{vendorItems[0].vendorName}</Text>
            {vendorItems.map((item) => (
              <View key={item.lineKey} className="flex-row mb-3 pb-3">
                <Image
                  source={{ uri: productImage(item.image) }}
                  className="w-20 h-20 rounded-xl bg-navy"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="font-semibold text-ice" numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.options && Object.keys(item.options).length ? (
                    <Text className="text-xs text-mute mt-0.5">
                      {Object.entries(item.options)
                        .map(([key, value]) => `${key} ${value}`)
                        .join(' · ')}
                    </Text>
                  ) : null}
                  <Text className="text-glow font-bold mt-1">R{item.price.toFixed(2)}</Text>
                  <View className="flex-row items-center mt-2">
                    <TouchableOpacity
                      className="w-7 h-7 border border-glow/30 rounded-lg items-center justify-center"
                      onPress={() => updateQuantity(item.lineKey, item.quantity - 1)}
                    >
                      <Text className="text-lg text-ice">−</Text>
                    </TouchableOpacity>
                    <Text className="w-8 text-center text-ice">{item.quantity}</Text>
                    <TouchableOpacity
                      className="w-7 h-7 border border-glow/30 rounded-lg items-center justify-center"
                      onPress={() => updateQuantity(item.lineKey, item.quantity + 1)}
                    >
                      <Text className="text-lg text-ice">+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="ml-auto" onPress={() => removeItem(item.lineKey)}>
                      <Feather name="trash-2" size={20} color={mmall.signal} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
            <View className="flex-row justify-between mt-2">
              <Text className="text-mute">Subtotal</Text>
              <Text className="font-semibold text-ice">
                R{vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      />

      <View className="absolute bottom-0 left-0 right-0 bg-navy p-4">
        <View className="flex-row justify-between mb-3">
          <Text className="text-mute">Total ({items.length} items)</Text>
          <Text className="text-xl font-bold text-ice">R{getTotal().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          className="bg-signal py-3 rounded-2xl"
          onPress={() => router.push('/(customer)/cart/checkout')}
        >
          <Text className="text-white text-center font-bold text-lg">Proceed to checkout</Text>
        </TouchableOpacity>
        <TouchableOpacity className="mt-3" onPress={clearCart}>
          <Text className="text-mute text-center">Clear basket</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
