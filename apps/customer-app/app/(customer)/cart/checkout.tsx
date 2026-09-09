import { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useCartStore } from '../../../stores/cartStore'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { mmall } from '../../../lib/theme'

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'South Africa',
  })

  const handlePlaceOrder = async () => {
    if (!token) {
      Alert.alert('Sign in required', 'Please login to place an order')
      router.push('/(auth)/login')
      return
    }

    if (!address.street || !address.city || !address.postalCode) {
      Alert.alert('Missing address', 'Please fill in street, city, and postal code')
      return
    }

    setLoading(true)
    try {
      const shippingAddress = {
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Customer',
        line1: address.street,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      }

      const response = await api.orders.create(
        {
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress,
          billingAddress: shippingAddress,
        },
        token,
      )

      Alert.alert(
        'Order placed',
        `Your MMall order #${response.id.slice(0, 8)} has been placed successfully.`,
        [
          {
            text: 'View orders',
            onPress: () => {
              clearCart()
              router.replace('/(customer)/orders')
            },
          },
          {
            text: 'Continue shopping',
            onPress: () => {
              clearCart()
              router.replace('/(customer)/browse')
            },
          },
        ],
      )
    } catch (error) {
      Alert.alert('Checkout failed', error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-void p-4">
      <Text className="text-2xl font-bold mb-6 text-ice">Checkout</Text>

      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">Order summary</Text>
        {items.map((item) => (
          <View key={item.productId} className="flex-row justify-between py-1">
            <Text className="text-sm flex-1 text-mute">
              {item.quantity}x {item.name}
            </Text>
            <Text className="text-sm font-medium text-ice">R{(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
        <View className="mt-2 pt-2 flex-row justify-between">
          <Text className="font-bold text-ice">Total</Text>
          <Text className="font-bold text-lg text-glow">R{getTotal().toFixed(2)}</Text>
        </View>
      </View>

      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">Shipping address</Text>
        <TextInput
          className="border border-glow/20 rounded-xl px-3 py-2 mb-3 text-ice bg-navy"
          placeholder="Street address"
          placeholderTextColor={mmall.mute}
          value={address.street}
          onChangeText={(street) => setAddress({ ...address, street })}
        />
        <TextInput
          className="border border-glow/20 rounded-xl px-3 py-2 mb-3 text-ice bg-navy"
          placeholder="City"
          placeholderTextColor={mmall.mute}
          value={address.city}
          onChangeText={(city) => setAddress({ ...address, city })}
        />
        <TextInput
          className="border border-glow/20 rounded-xl px-3 py-2 mb-3 text-ice bg-navy"
          placeholder="Province/State"
          placeholderTextColor={mmall.mute}
          value={address.state}
          onChangeText={(state) => setAddress({ ...address, state })}
        />
        <TextInput
          className="border border-glow/20 rounded-xl px-3 py-2 text-ice bg-navy"
          placeholder="Postal code"
          placeholderTextColor={mmall.mute}
          value={address.postalCode}
          onChangeText={(postalCode) => setAddress({ ...address, postalCode })}
        />
      </View>

      <TouchableOpacity className="bg-signal py-4 rounded-2xl" onPress={handlePlaceOrder} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">Place order • R{getTotal().toFixed(2)}</Text>
        )}
      </TouchableOpacity>
      <Text className="text-xs text-mute text-center mt-4 mb-8">
        Payment will be processed after the order is confirmed (PayFast coming soon)
      </Text>
    </ScrollView>
  )
}
