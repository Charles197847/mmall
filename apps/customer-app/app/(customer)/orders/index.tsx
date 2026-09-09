import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { mmall } from '../../../lib/theme'

function statusStyle(status: string) {
  switch (status) {
    case 'PENDING':
      return 'bg-amber-400/20 text-amber-300'
    case 'PROCESSING':
      return 'bg-brand/20 text-glow'
    case 'SHIPPED':
      return 'bg-violet-400/20 text-violet-300'
    case 'DELIVERED':
      return 'bg-emerald-400/20 text-emerald-300'
    case 'CANCELLED':
      return 'bg-signal/20 text-signal'
    default:
      return 'bg-navy text-mute'
  }
}

export default function OrdersScreen() {
  const { token } = useAuth()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.orders.list(token!),
    enabled: Boolean(token),
    staleTime: 30_000,
  })

  if (!token) {
    return (
      <View className="flex-1 justify-center items-center bg-void p-4">
        <Text className="text-lg text-mute mb-4">Sign in to see your orders</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')} className="bg-brand px-6 py-3 rounded-2xl">
          <Text className="text-white font-semibold">Sign in</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-void">
        <ActivityIndicator size="large" color={mmall.glow} />
      </View>
    )
  }

  if (!orders?.length) {
    return (
      <View className="flex-1 justify-center items-center bg-void p-4">
        <Text className="text-lg text-mute">No orders yet</Text>
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
    <View className="flex-1 bg-void p-4">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-panel rounded-2xl p-4 mb-4"
            onPress={() => router.push(`/(customer)/orders/${item.id}`)}
          >
            <View className="flex-row justify-between mb-2">
              <Text className="font-semibold text-ice">Order #{item.id.slice(0, 8)}</Text>
              <Text className="text-sm text-mute">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-mute">{item.items?.length || 0} items</Text>
              <Text className="font-bold text-glow">R{item.totalAmount.toFixed(2)}</Text>
            </View>
            <View className="mt-2">
              <Text className={`text-xs px-2 py-1 rounded-full self-start ${statusStyle(item.status)}`}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
