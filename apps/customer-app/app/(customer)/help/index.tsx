import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { CourtNav } from '../../../components/mall/CourtNav'
import { MallChrome } from '../../../components/mall/MallChrome'
import { PageTitle } from '../../../components/mall/PageTitle'
import { formatMoney } from '../../../lib/utils/format'
import { useWalletStore } from '../../../stores/walletStore'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'
import { api } from '../../../lib/api'

const jumps = [
  { id: 'orders', label: 'Orders' },
  { id: 'returns', label: 'Returns and refunds' },
  { id: 'account', label: 'Your account' },
  { id: 'contact', label: 'Contact us' },
  { id: 'gifts', label: 'Gift card balance' },
  { id: 'vouchers', label: 'Vouchers earned' },
]

export default function HelpScreen() {
  const { user, token } = useAuth()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const [note, setNote] = useState('')
  const [section, setSection] = useState('orders')
  const cards = useWalletStore((state) => state.cards.filter((card) => card.status === 'active' && card.remaining > 0))
  const vouchers = useWalletStore((state) => state.vouchers)
  const balance = cards.reduce((sum, card) => sum + card.remaining, 0)
  const orders = useQuery({
    queryKey: ['shop-help-orders', token],
    queryFn: () => api.orders.list(token!),
    enabled: Boolean(token),
    retry: false,
  })

  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <ScrollView contentContainerClassName="pb-12">
        <CourtNav />
        <PageTitle
          kicker="Desk"
          title="Customer service"
          lede="Orders, returns, your account, gift cards, and vouchers — one desk for the mall."
        />
        <View className="px-4">

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5" contentContainerClassName="gap-2">
            {jumps.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setSection(item.id)}
                className={`rounded-full border px-3.5 items-center justify-center ${
                  section === item.id ? 'bg-brand border-brand' : 'bg-panel border-ice/10'
                }`}
                style={{ minHeight: 40 }}
              >
                <Text className={`text-xs ${section === item.id ? 'text-white' : 'text-ice'}`}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {section === 'orders' ? (
            <View className="mt-6">
              <Text className="text-ice font-semibold text-xl">Orders</Text>
              {!token ? (
                <Link href="/(auth)/login" className="mt-3">
                  <Text className="text-glow">Sign in to see orders placed on the mall.</Text>
                </Link>
              ) : orders.isError ? (
                <Text className="text-mute mt-2">No live orders on this account yet.</Text>
              ) : (
                (orders.data ?? []).map((order) => (
                  <Pressable
                    key={order.id}
                    className="mt-3 rounded-xl bg-panel px-4 py-3"
                    onPress={() => router.push(`/(customer)/orders/${order.id}`)}
                  >
                    <Text className="text-ice font-semibold">#{order.id.slice(0, 8)}</Text>
                    <Text className="text-mute text-sm mt-1">
                      {order.status} · {formatMoney(order.totalAmount ?? 0)}
                    </Text>
                  </Pressable>
                ))
              )}
              {user ? (
                <Pressable className="mt-5 bg-brand rounded-full py-3" onPress={() => router.push('/(customer)/orders')}>
                  <Text className="text-white text-center font-semibold">View my orders</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {section === 'returns' ? (
            <View className="mt-6 bg-panel rounded-2xl p-4">
              <Text className="text-ice font-semibold">Returns</Text>
              <Text className="text-mute mt-2 leading-6">
                Most court items can be returned within 7 days if unused and in original packing. Food court and salon
                slots are final sale.
              </Text>
            </View>
          ) : null}

          {section === 'account' ? (
            <View className="mt-6 bg-panel rounded-2xl p-4">
              <Text className="text-ice font-semibold">Your account</Text>
              <Text className="text-mute mt-2 leading-6">
                Sign in to save Deliver to, Loved listings, and PayGate checkout. Profile holds your address and passkeys
                on web.
              </Text>
              <Pressable className="mt-3" onPress={() => router.push('/(customer)/profile')}>
                <Text className="text-glow">Open profile</Text>
              </Pressable>
            </View>
          ) : null}

          {section === 'gifts' ? (
            <View className="mt-6 bg-panel rounded-2xl p-4">
              <Text className="text-ice font-semibold">Gift card balance</Text>
              <Text className="text-mute mt-2">{formatMoney(balance)} across {cards.length} active cards.</Text>
              <Pressable className="mt-3" onPress={() => router.push('/(customer)/gift-cards')}>
                <Text className="text-glow">Open wallet</Text>
              </Pressable>
            </View>
          ) : null}

          {section === 'vouchers' ? (
            <View className="mt-6 bg-panel rounded-2xl p-4">
              <Text className="text-ice font-semibold">Vouchers earned</Text>
              <Text className="text-mute mt-2">{vouchers.length ? vouchers.join(' · ') : 'No vouchers saved yet.'}</Text>
              <Pressable className="mt-3" onPress={() => router.push('/(customer)/vouchers')}>
                <Text className="text-glow">Browse vouchers</Text>
              </Pressable>
            </View>
          ) : null}

          {section === 'contact' ? (
            <View className="mt-6 bg-panel rounded-2xl p-4">
              <Text className="text-ice font-semibold">Write to the desk</Text>
              <TextInput
                className="mt-3 rounded-2xl bg-navy px-4 py-3 text-ice min-h-[96px]"
                placeholder="What do you need help with?"
                placeholderTextColor={colors.mute}
                multiline
                value={note}
                onChangeText={setNote}
              />
              <Pressable
                className="mt-3 rounded-full bg-brand py-3"
                onPress={() => {
                  setNote('')
                  Alert.alert('Desk', 'We have the note. Preview builds do not email the mall yet.')
                }}
              >
                <Text className="text-white text-center font-semibold">Send</Text>
              </Pressable>
            </View>
          ) : null}

          <View className="mt-8">
            <Link href="/(auth)/legal-shopper" className="mb-2">
              <Text className="text-mute">Shopper Terms</Text>
            </Link>
            <Link href="/(auth)/legal-privacy">
              <Text className="text-mute">Privacy Notice</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
