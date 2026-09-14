import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import type { ShippingQuote } from '@shopping-mall/shared-types'
import { quoteCourierGuy, searchSaPlaces, shopperAreaFromAddress } from '@shopping-mall/shared-types'
import { useCartStore } from '../../../stores/cartStore'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { mmall } from '../../../lib/theme'
import { useAreaStore } from '../../../stores/areaStore'
import { useWalletStore, shopVouchers, voucherDiscount } from '../../../stores/walletStore'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'
import { persistShopperArea } from '../../../lib/location'
import { formatMoney } from '../../../lib/utils/format'

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
  const clearCart = useCartStore((s) => s.clearCart)
  const { token, user } = useAuth()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const savedVouchers = useWalletStore((state) => state.vouchers)
  const peekGiftCard = useWalletStore((state) => state.peekGiftCard)
  const redeemGiftCard = useWalletStore((state) => state.redeemGiftCard)
  const [loading, setLoading] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [quotes, setQuotes] = useState<ShippingQuote[]>([])
  const [service, setService] = useState<'ECO' | 'OVN' | 'SDD'>('ECO')
  const [voucherCode, setVoucherCode] = useState('')
  const [giftCode, setGiftCode] = useState('')
  const [giftCredit, setGiftCredit] = useState(0)
  const [giftNote, setGiftNote] = useState('')
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
  const subtotal = getTotal()
  const voucherOff = voucherDiscount(voucherCode, subtotal)
  const afterVoucher = Math.max(0, subtotal - voucherOff)
  const shipping = selected?.amount ?? 0
  const giftCreditApplied = Math.min(giftCredit, afterVoucher + shipping)
  const grandTotal = Math.max(0, afterVoucher + shipping - giftCreditApplied)

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
      if (items.every((item) => item.productId.startsWith('mock-'))) {
        setQuoting(false)
        return
      }
      setQuoting(true)
      api.shipping
        .quote({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
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
      if (grandTotal <= 0) {
        if (giftCreditApplied && giftCode) redeemGiftCard(giftCode, giftCreditApplied)
        clearCart()
        Alert.alert('Paid with mall credit', 'This bag was covered by a gift card and voucher.')
        router.replace('/(customer)/orders')
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
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          shippingAddress,
          billingAddress: shippingAddress,
          shippingServiceCode: selected.serviceLevelCode,
          paymentReturnUrl,
        },
        token,
      )
      const checkoutUrl = response.paygate?.checkoutUrl
      if (!checkoutUrl) throw new Error('PayGate session was not created')
      const spendGift = () => {
        if (giftCreditApplied && giftCode) redeemGiftCard(giftCode, giftCreditApplied)
      }
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        spendGift()
        window.location.href = checkoutUrl
        return
      }
      const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, paymentReturnUrl)
      if (result.type === 'success' && result.url) {
        spendGift()
        const parsed = Linking.parse(result.url)
        router.replace({
          pathname: '/(customer)/cart/payment-return',
          params: (parsed.queryParams ?? {}) as Record<string, string>,
        })
        return
      }
      if (result.type === 'cancel') return
      spendGift()
      router.replace('/(customer)/cart/payment-return')
    } catch (error) {
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
    <ScrollView className="flex-1 bg-void p-4">
      <Text className="text-2xl font-bold mb-6 text-ice">Checkout</Text>

      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">Order summary</Text>
        {items.map((item) => (
          <View key={item.lineKey} className="flex-row justify-between py-1">
            <Text className="text-sm flex-1 text-mute">
              {item.quantity}x {item.name}
              {item.options && Object.keys(item.options).length
                ? ` (${Object.values(item.options).join(', ')})`
                : ''}
            </Text>
            <Text className="text-sm font-medium text-ice">{formatMoney(item.price * item.quantity)}</Text>
          </View>
        ))}
        <View className="mt-2 flex-row justify-between">
          <Text className="text-mute">Subtotal</Text>
          <Text className="text-ice">{formatMoney(subtotal)}</Text>
        </View>
        {voucherOff ? (
          <View className="flex-row justify-between">
            <Text className="text-mute">Voucher {voucherCode}</Text>
            <Text className="text-ice">−{formatMoney(voucherOff)}</Text>
          </View>
        ) : null}
        <View className="flex-row justify-between">
          <Text className="text-mute">The Courier Guy</Text>
          <Text className="text-ice">{selected ? formatMoney(selected.amount) : '—'}</Text>
        </View>
        {giftCreditApplied ? (
          <View className="flex-row justify-between">
            <Text className="text-mute">Gift card</Text>
            <Text className="text-ice">−{formatMoney(giftCreditApplied)}</Text>
          </View>
        ) : null}
        <View className="mt-2 pt-2 flex-row justify-between">
          <Text className="font-bold text-ice">PayGate total</Text>
          <Text className="font-bold text-lg text-glow">{formatMoney(grandTotal)}</Text>
        </View>
      </View>

      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">Promotional voucher</Text>
        {savedVouchers.length ? (
          savedVouchers.map((code) => {
            const voucher = shopVouchers.find((item) => item.code === code)
            return (
              <Pressable
                key={code}
                onPress={() => setVoucherCode(voucherCode === code ? '' : code)}
                className={`rounded-xl px-3 py-3 mb-2 border ${
                  voucherCode === code ? 'border-brand bg-navy' : 'border-ice/10'
                }`}
              >
                <Text className="text-ice font-semibold">{code}</Text>
                <Text className="text-mute text-xs mt-1">
                  {voucher?.shop} · min {formatMoney(voucher?.minSpend ?? 0)}
                </Text>
              </Pressable>
            )
          })
        ) : (
          <Pressable onPress={() => router.push('/(customer)/vouchers')}>
            <Text className="text-mute">Save a voucher first</Text>
          </Pressable>
        )}
        <Text className="font-bold mt-4 mb-3 text-ice">Gift card</Text>
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 border border-ice/10 rounded-xl px-3 py-2 text-ice bg-navy"
            placeholder="MM-••••-••••-••••-••••"
            placeholderTextColor={colors.mute}
            autoCapitalize="characters"
            value={giftCode}
            onChangeText={(value) => {
              setGiftCode(value)
              setGiftCredit(0)
              setGiftNote('')
            }}
          />
          <Pressable
            className="bg-navy rounded-xl px-4 justify-center"
            onPress={() => {
              try {
                const card = peekGiftCard(giftCode)
                setGiftCredit(card.remaining)
                setGiftNote(`${formatMoney(card.remaining)} available`)
              } catch (error) {
                setGiftCredit(0)
                setGiftNote(error instanceof Error ? error.message : 'Invalid code')
              }
            }}
          >
            <Text className="text-ice">Apply</Text>
          </Pressable>
        </View>
        {giftNote ? <Text className="text-xs text-mute mt-2">{giftNote}</Text> : null}
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
        {cities.length ? (
          <View className="flex-row flex-wrap mb-3">
            {cities.map((place) => (
              <Pressable
                key={`${place.city}-${place.postalCode}`}
                className="rounded-full bg-navy px-3 py-1 mr-2 mb-2"
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
        disabled={loading || (Boolean(token) && !selected)}
        accessibilityRole="button"
        accessibilityLabel={`Pay with PayGate, ${grandTotal.toFixed(2)} rand`}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">
            {!token
              ? 'Save address and sign in'
              : grandTotal > 0
                ? `Pay with PayGate · ${formatMoney(grandTotal)}`
                : 'Place order with mall credit'}
          </Text>
        )}
      </TouchableOpacity>
      <Text className="text-xs text-mute text-center mt-4 mb-8">
        Mock PayWeb checkout — Visa or Instant EFT. No live card is charged.
      </Text>
    </ScrollView>
  )
}
