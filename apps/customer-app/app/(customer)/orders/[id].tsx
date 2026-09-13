import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { mmall } from '../../../lib/theme'

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { token } = useAuth()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.orders.get(id, token!),
    enabled: Boolean(id && token),
  })

  if (isLoading || !order) {
    return (
      <View className="flex-1 justify-center items-center bg-void">
        {isLoading ? <ActivityIndicator size="large" color={mmall.glow} /> : <Text className="text-ice">Order not found</Text>}
      </View>
    )
  }

  const shipments = order.vendorOrders?.flatMap((row) => row.shipments ?? []) ?? []

  return (
    <ScrollView className="flex-1 bg-void p-4">
      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="text-xl font-bold text-ice">Order #{order.id.slice(0, 8)}</Text>
        <Text className="text-mute mt-1">
          {order.status} · PayGate {order.paymentStatus}
          {order.paymentMethod ? ` · ${order.paymentMethod}` : ''}
        </Text>
        <Text className="text-2xl font-bold mt-3 text-glow">R{order.totalAmount.toFixed(2)}</Text>
        <Text className="text-xs text-mute mt-1">
          Includes Courier Guy shipping R{(order.shippingTotal ?? 0).toFixed(2)}
        </Text>
      </View>
      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="font-bold mb-3 text-ice">Items</Text>
        {order.items?.map((item) => (
          <View key={item.id} className="flex-row justify-between py-2">
            <Text className="flex-1 text-mute">
              {item.quantity}x {item.product?.name ?? item.productId}
            </Text>
            <Text className="font-medium text-ice">R{item.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View className="bg-panel rounded-2xl p-4 mb-8">
        <Text className="font-bold mb-3 text-ice">The Courier Guy</Text>
        {!shipments.length ? (
          <Text className="text-mute text-sm">Waiting for the vendor to book collection after PayGate settlement.</Text>
        ) : (
          shipments.map((shipment) => (
            <View key={shipment.id} className="mb-4">
              <Text className="text-ice font-semibold">{shipment.trackingNumber}</Text>
              <Text className="text-xs text-mute mb-2">
                {shipment.serviceName} · {shipment.status.replaceAll('_', ' ')}
              </Text>
              {(shipment.events ?? []).map((event) => (
                <Text key={`${event.at}-${event.status}`} className="text-sm text-mute mb-1">
                  {new Date(event.at).toLocaleString()} — {event.description}
                </Text>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}
