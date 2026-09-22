import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import type { ShippingQuote } from '@shopping-mall/shared-types'
import { quoteCourierGuy, searchSaPlaces, shopperAreaFromAddress } from '@shopping-mall/shared-types'
import { useCartStore } from '../../../stores/cartStore'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'
import { useAreaStore } from '../../../stores/areaStore'
import { persistShopperArea } from '../../../lib/location'
import { formatMoney } from '../../../lib/utils/format'
import { clearPendingCheckout, isDemoSku, rememberPendingCheckout } from '../../../lib/pendingCheckout'

function keepFieldVisible(event: { target?: unknown }) {
  if (Platform.OS !== 'web') return
  const node = event.target as { scrollIntoView?: (options: ScrollIntoViewOptions) => void } | null
  requestAnimationFrame(() => node?.scrollIntoView?.({ block: 'center', inline: 'nearest' }))
}

function useWebKeyboardInset() {
  const [inset, setInset] = useState(0)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.visualViewport) return
    const viewport = window.visualViewport
    const update = () => {
      setInset(Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop))
    }
    update()
    viewport.addEventListener('resize', update)
    viewport.addEventListener('scroll', update)
    return () => {
      viewport.removeEventListener('resize', update)
      viewport.removeEventListener('scroll', update)
    }
  }, [])
  return inset
}

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
  const colors = palettes[useThemeStore((state) => state.mode)]
  const insets = useSafeAreaInsets()
  const webKeyboard = useWebKeyboardInset()
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
    const deliver = useAreaStore.getState().place
    const place = shopperAreaFromAddress(saved) ?? shopperAreaFromAddress(web)
    setAddress((current) => ({
      ...current,
      street: saved?.line1 || current.street,
      city: place?.city || saved?.city || web?.city || deliver?.city || current.city,
      state: place?.province || saved?.state || web?.province || deliver?.province || current.state,
      postalCode: place?.postalCode || saved?.postalCode || web?.postalCode || deliver?.postalCode || current.postalCode,
    }))
    setHydrated(true)
  }, [user, hydrated])

  const selected = quotes.find((item) => item.serviceLevelCode === service && item.available) ?? quotes.find((item) => item.available)
  const liveItems = items.filter((item) => !isDemoSku(item.productId))
  const demoItems = items.filter((item) => isDemoSku(item.productId))
  const liveSubtotal = liveItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const subtotal = getTotal()
  const shipping = selected?.amount ?? 0
  const paygateTotal = liveSubtotal + shipping

  useEffect(() => {
    if (!address.city || address.city.length < 3 || !items.length) return
    const handle = setTimeout(() => {
      const local = quoteCourierGuy({
        collectionCity: 'Johannesburg',
        deliveryCity: address.city,
        weightKg: Math.max(1, items.reduce((sum, item) => sum + item.quantity * 0.8, 0)),
      })
      setQuotes(local)
      const first = local.find((item) => item.available)
      if (first) setService(first.serviceLevelCode)
      if (items.every((item) => isDemoSku(item.productId))) {
        setQuoting(false)
        return
      }
      setQuoting(true)
      api.shipping
        .quote({
          items: items
            .filter((item) => !isDemoSku(item.productId))
            .map((item) => ({ productId: item.productId, quantity: item.quantity })),
          address: { city: address.city, postalCode: address.postalCode, street: address.street, state: address.state },
        })
        .then((result) => {
          setQuotes(result.quotes)
          const next = result.quotes.find((item) => item.available)
          if (next) setService(next.serviceLevelCode)
        })
        .catch(() => undefined)
        .finally(() => setQuoting(false))
    }, 400)
    return () => clearTimeout(handle)
  }, [address.city, address.postalCode, items])

  const handlePlaceOrder = async () => {
    if (!token) {
      const next = shopperAreaFromAddress(address)
      if (next) await persistShopperArea(next)
      router.push('/(auth)/login?next=/cart/checkout' as never)
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
      if (!liveItems.length) {
        Alert.alert('Demo listings', 'Demo catalog items cannot be charged through PayGate. Add a live product to place a mock payment.')
        return
      }
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
      const paymentReturnUrl = Linking.createURL('/cart/payment-return')
      const response = await api.orders.create(
        {
          items: liveItems.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          shippingAddress,
          billingAddress: shippingAddress,
          shippingServiceCode: selected.serviceLevelCode,
          paymentReturnUrl,
        },
        token,
      )
      const checkoutUrl = response.paygate?.checkoutUrl
      if (!checkoutUrl) throw new Error('PayGate session was not created')
      rememberPendingCheckout({
        orderId: response.id,
        payRequestId: response.payRequestId,
      })
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = checkoutUrl
        return
      }
      const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, paymentReturnUrl)
      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url)
        router.replace({
          pathname: '/(customer)/cart/payment-return',
          params: (parsed.queryParams ?? {}) as Record<string, string>,
        })
        return
      }
      if (result.type === 'cancel') {
        clearPendingCheckout()
        return
      }
      router.replace('/(customer)/cart/payment-return')
    } catch (error) {
      clearPendingCheckout()
      Alert.alert('Checkout failed', error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const cities = useMemo(() => searchSaPlaces(address.city, 6), [address.city])
  const quoteHint = useMemo(() => {
    if (quoting) return 'Getting Courier Guy rates…'
    if (!address.city) return 'Enter a city to price The Courier Guy'
    return null
  }, [quoting, address.city])

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-void"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
      style={{ paddingBottom: webKeyboard }}
    >
    <ScrollView
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      contentContainerClassName="p-4 pb-4"
    >
      <Text className="text-2xl font-bold mb-2 text-ice">Checkout</Text>
      <Text className="text-xs text-mute mb-6">Demo payment via mock PayGate. No live card is charged.</Text>

      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">Order summary</Text>
        {items.map((item) => (
          <View key={item.lineKey} className="flex-row justify-between py-1">
            <Text className="text-sm flex-1 text-mute">
              {item.quantity}x {item.name}
              {isDemoSku(item.productId) ? ' · demo listing' : ''}
              {item.options && Object.keys(item.options).length
                ? ` (${Object.values(item.options).join(', ')})`
                : ''}
            </Text>
            <Text className="text-sm font-medium text-ice">{formatMoney(item.price * item.quantity)}</Text>
          </View>
        ))}
        <View className="mt-2 flex-row justify-between">
          <Text className="text-mute">Live subtotal</Text>
          <Text className="text-ice">{formatMoney(liveSubtotal)}</Text>
        </View>
        {demoItems.length ? (
          <View className="flex-row justify-between">
            <Text className="text-mute">Demo listings (not charged)</Text>
            <Text className="text-ice">{formatMoney(subtotal - liveSubtotal)}</Text>
          </View>
        ) : null}
        <View className="flex-row justify-between">
          <Text className="text-mute">The Courier Guy</Text>
          <Text className="text-ice">{selected ? formatMoney(selected.amount) : '—'}</Text>
        </View>
        <View className="mt-2 pt-2 flex-row justify-between">
          <Text className="font-bold text-ice">Mock PayGate total</Text>
          <Text className="font-bold text-lg text-glow">{formatMoney(paygateTotal)}</Text>
        </View>
      </View>

      <View className="bg-panel rounded-2xl p-4 mb-4 opacity-50">
        <Text className="font-bold mb-2 text-ice">Gift card and voucher</Text>
        <Text className="text-xs text-mute">
          Local mall credit is not applied on mock PayGate. The charged total is live items plus courier.
        </Text>
        <View className="flex-row gap-2 mt-3">
          <TextInput
            editable={false}
            className="flex-1 border border-ice/10 rounded-xl px-3 text-mute bg-navy"
            style={{ minHeight: 44 }}
            placeholder="Not applied on mock PayGate"
            placeholderTextColor={colors.mute}
          />
          <View className="bg-navy rounded-xl px-4 justify-center" style={{ minHeight: 44 }}>
            <Text className="text-mute">Apply</Text>
          </View>
        </View>
      </View>

      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">Shipping address</Text>
        <TextInput
            className="border border-glow/20 rounded-xl px-3 mb-3 text-ice bg-navy"
            style={{ minHeight: 44 }}
          placeholder="Street address"
          placeholderTextColor={colors.mute}
          value={address.street}
          onChangeText={(street) => setAddress({ ...address, street })}
          onFocus={keepFieldVisible}
          accessibilityLabel="Street address"
        />
        <TextInput
            className="border border-glow/20 rounded-xl px-3 mb-3 text-ice bg-navy"
            style={{ minHeight: 44 }}
          placeholder="City"
          placeholderTextColor={colors.mute}
          value={address.city}
          onChangeText={(city) => setAddress({ ...address, city })}
          onFocus={keepFieldVisible}
          accessibilityLabel="City"
        />
        {cities.length ? (
          <View className="flex-row flex-wrap mb-3">
            {cities.map((place) => (
              <Pressable
                key={`${place.city}-${place.postalCode}`}
                className="rounded-full bg-navy px-3 mr-2 mb-2 items-center justify-center"
                style={{ minHeight: 36 }}
                onPress={() => {
                  setAddress((current) => ({
                    ...current,
                    city: place.city,
                    state: place.province,
                    postalCode: place.postalCode,
                  }))
                  void persistShopperArea({ ...place, source: 'search' }, token, user)
                }}
              >
                <Text className="text-xs text-ice">{place.city}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <TextInput
            className="border border-glow/20 rounded-xl px-3 mb-3 text-ice bg-navy"
            style={{ minHeight: 44 }}
          placeholder="Province"
          placeholderTextColor={colors.mute}
          value={address.state}
          onChangeText={(state) => setAddress({ ...address, state })}
          onFocus={keepFieldVisible}
          accessibilityLabel="Province"
        />
        <TextInput
          className="border border-glow/20 rounded-xl px-3 text-ice bg-navy"
          style={{ minHeight: 44 }}
          placeholder="Postal code"
          placeholderTextColor={colors.mute}
          value={address.postalCode}
          onChangeText={(postalCode) => setAddress({ ...address, postalCode })}
          onFocus={keepFieldVisible}
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

    </ScrollView>
    <View
      className="bg-void px-4 pt-3"
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        borderTopWidth: 1,
        borderTopColor: 'rgba(232,238,252,0.12)',
      }}
    >
      <TouchableOpacity
        className="bg-signal py-4 rounded-2xl"
        onPress={handlePlaceOrder}
        disabled={loading || (Boolean(token) && (!selected || !liveItems.length))}
        accessibilityRole="button"
        accessibilityLabel={`Demo payment with PayGate mock, ${paygateTotal.toFixed(2)} rand`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">
            {!token
              ? 'Save address and sign in'
              : liveItems.length
                ? `Demo payment · PayGate mock · ${formatMoney(paygateTotal)}`
                : 'Demo listings cannot be charged'}
          </Text>
        )}
      </TouchableOpacity>
      <Text className="text-xs text-mute text-center mt-2">
        Mock PayWeb checkout — Visa or Instant EFT stand-in. No live card is charged. Stock is committed only after this demo payment succeeds.
      </Text>
    </View>
    </KeyboardAvoidingView>
  )
}
