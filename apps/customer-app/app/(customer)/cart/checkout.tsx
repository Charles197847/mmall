import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import type { ShippingQuote } from '@shopping-mall/shared-types'
import { shopperAreaFromAddress } from '@shopping-mall/shared-types'
import { useCartStore } from '../../../stores/cartStore'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { mmall } from '../../../lib/theme'

function readWebDeliverTo() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem('mmall-deliver-to')
    return raw ? (JSON.parse(raw) as { city?: string; province?: string; postalCode?: string }) : null
  } catch {
    return null
  }
}

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const { token, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [service, setService] = useState<'ECO' | 'OVN' | 'SDD'>('ECO')
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'South Africa',
  })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (hydrated) return
    const saved = user?.deliveryAddress
    const web = readWebDeliverTo()
    const place = shopperAreaFromAddress(saved) ?? shopperAreaFromAddress(web)
    setAddress((current) => ({
      ...current,
      street: saved?.line1 || current.street,
      city: place?.city || saved?.city || web?.city || current.city,
      state: place?.province || saved?.state || web?.province || current.state,
      postalCode: place?.postalCode || saved?.postalCode || web?.postalCode || current.postalCode,
    }))
    setHydrated(true)
  }, [user, hydrated])

  const selected = quotes.find((item) => item.serviceLevelCode === service && item.available) ?? quotes.find((item) => item.available)
  const grandTotal = getTotal() + (selected?.amount ?? 0)

  useEffect(() => {
    if (!address.city || address.city.length < 3 || !items.length) return
    const handle = setTimeout(() => {
      setQuoting(true)
      api.shipping
        .quote({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          address: { city: address.city, postalCode: address.postalCode, street: address.street, state: address.state },
        })
        .then((result) => {
          setQuotes(result.quotes)
          const first = result.quotes.find((item) => item.available)
          if (first) setService(first.serviceLevelCode)
        })
        .catch(() => setQuotes([]))
        .finally(() => setQuoting(false))
    }, 400)
    return () => clearTimeout(handle)
  }, [address.city, address.postalCode, items])

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
    if (!selected) {
      Alert.alert('Shipping', 'Choose a Courier Guy service first')
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
      if (token) {
        await api.auth.updateAddress(shippingAddress, token).catch(() => undefined)
      }
      const response = await api.orders.create(
        {
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          shippingAddress,
          billingAddress: shippingAddress,
          shippingServiceCode: selected.serviceLevelCode,
        },
        token,
      )
      const checkoutUrl = response.paygate?.checkoutUrl
      if (!checkoutUrl) throw new Error('PayGate session was not created')
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = checkoutUrl
        return
      }
      await Linking.openURL(checkoutUrl)
    } catch (error) {
      Alert.alert('Checkout failed', error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const quoteHint = useMemo(() => {
    if (quoting) return 'Getting Courier Guy rates…'
    if (!address.city) return 'Enter a city to price The Courier Guy'
    return null
  }, [quoting, address.city])

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
        <View className="mt-2 flex-row justify-between">
          <Text className="text-mute">Subtotal</Text>
          <Text className="text-ice">R{getTotal().toFixed(2)}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-mute">The Courier Guy</Text>
          <Text className="text-ice">{selected ? `R${selected.amount.toFixed(2)}` : '—'}</Text>
        </View>
        <View className="mt-2 pt-2 flex-row justify-between">
          <Text className="font-bold text-ice">PayGate total</Text>
          <Text className="font-bold text-lg text-glow">R{grandTotal.toFixed(2)}</Text>
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
          accessibilityLabel="Street address"
        />
        <TextInput
          className="border border-glow/20 rounded-xl px-3 py-2 mb-3 text-ice bg-navy"
          placeholder="City"
          placeholderTextColor={mmall.mute}
          value={address.city}
          onChangeText={(city) => setAddress({ ...address, city })}
          accessibilityLabel="City"
        />
        <TextInput
          className="border border-glow/20 rounded-xl px-3 py-2 mb-3 text-ice bg-navy"
          placeholder="Province"
          placeholderTextColor={mmall.mute}
          value={address.state}
          onChangeText={(state) => setAddress({ ...address, state })}
          accessibilityLabel="Province"
        />
        <TextInput
          className="border border-glow/20 rounded-xl px-3 py-2 text-ice bg-navy"
          placeholder="Postal code"
          placeholderTextColor={mmall.mute}
          value={address.postalCode}
          onChangeText={(postalCode) => setAddress({ ...address, postalCode })}
          accessibilityLabel="Postal code"
        />
      </View>

      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">The Courier Guy</Text>
        {quoteHint ? <Text className="text-xs text-mute mb-3">{quoteHint}</Text> : null}
        {quotes.map((quote) => (
          <TouchableOpacity
            key={quote.serviceLevelCode}
            disabled={!quote.available}
            onPress={() => setService(quote.serviceLevelCode)}
            accessibilityRole="button"
            accessibilityState={{ selected: selected?.serviceLevelCode === quote.serviceLevelCode, disabled: !quote.available }}
            accessibilityLabel={`${quote.serviceName}, ${quote.available ? `R${quote.amount.toFixed(2)}` : 'unavailable'}`}
            className={`rounded-xl px-3 py-3 mb-2 border ${
              selected?.serviceLevelCode === quote.serviceLevelCode ? 'border-glow bg-navy' : 'border-glow/20'
            } ${quote.available ? '' : 'opacity-40'}`}
          >
            <View className="flex-row justify-between">
              <Text className="text-ice font-semibold">{quote.serviceName}</Text>
              <Text className="text-glow">{quote.available ? `R${quote.amount.toFixed(2)}` : 'N/A'}</Text>
            </View>
            <Text className="text-xs text-mute mt-1">{quote.note}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="bg-signal py-4 rounded-2xl"
        onPress={handlePlaceOrder}
        disabled={loading || !selected}
        accessibilityRole="button"
        accessibilityLabel={`Pay with PayGate, ${grandTotal.toFixed(2)} rand`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">Pay with PayGate · R{grandTotal.toFixed(2)}</Text>
        )}
      </TouchableOpacity>
      <Text className="text-xs text-mute text-center mt-4 mb-8">
        Mock PayWeb checkout — Visa or Instant EFT. No live card is charged.
      </Text>
    </ScrollView>
  )
}
