import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { formatMoney } from '@shopping-mall/shared-types'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { DeskShell } from '../../../components/vendor/DeskShell'
import { KycBanner } from '../../../components/vendor/KycBanner'

export default function VendorDashboardScreen() {
  const { token, user } = useAuth()
  const me = useQuery({
    queryKey: ['vendor-me', token],
    queryFn: () => api.auth.me(token!),
    enabled: Boolean(token),
  })
  const stats = useQuery({
    queryKey: ['vendor-analytics', token],
    queryFn: () => api.vendors.analytics(token!),
    enabled: Boolean(token),
  })
  const kyc = useQuery({
    queryKey: ['vendor-kyc', token],
    queryFn: () => api.kyc.me(token!),
    enabled: Boolean(token),
  })
  const store = me.data?.vendor
  const name = store?.storeName ?? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()

  return (
    <DeskShell title={name || 'Your store'}>
      <KycBanner kyc={kyc.data} />
      <View className="flex-row flex-wrap -mx-1">
        {[
          { label: 'Revenue', value: formatMoney(stats.data?.totalRevenue ?? 0) },
          { label: 'Orders', value: String(stats.data?.totalOrders ?? 0) },
          { label: 'Products', value: String(stats.data?.totalProducts ?? 0) },
          { label: 'Pending', value: String(stats.data?.pendingOrders ?? 0) },
        ].map((card) => (
          <View key={card.label} className="w-1/2 px-1 mb-3">
            <View className="bg-panel rounded-2xl p-4">
              <Text className="text-mute text-xs">{card.label}</Text>
              <Text className="text-ice text-xl font-semibold mt-1">{card.value}</Text>
            </View>
          </View>
        ))}
      </View>
      <View className="bg-panel rounded-2xl p-4 mt-2">
        <Text className="text-ice font-semibold mb-3">Recent sales (7 days)</Text>
        {(stats.data?.salesTrend ?? []).length ? (
          (stats.data?.salesTrend ?? []).map((row) => (
            <View key={row.date} className="flex-row justify-between py-1">
              <Text className="text-mute text-sm">{row.date}</Text>
              <Text className="text-ice">{formatMoney(row.sales)}</Text>
            </View>
          ))
        ) : (
          <Text className="text-mute text-sm">No sales yet this week.</Text>
        )}
      </View>
      {store?.slug ? (
        <Pressable
          className="bg-brand rounded-full py-3 mt-6"
          onPress={() => router.push(`/(customer)/vendor/${store.slug}` as never)}
        >
          <Text className="text-white text-center font-semibold">View storefront</Text>
        </Pressable>
      ) : null}
    </DeskShell>
  )
}
