import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatMoney, type VendorOrderStatus } from '@shopping-mall/shared-types'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { DeskShell } from '../../../components/vendor/DeskShell'

const statuses: VendorOrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export default function VendorOrdersScreen() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [busyId, setBusyId] = useState<string | null>(null)
  const orders = useQuery({
    queryKey: ['vendor-orders', token],
    queryFn: () => api.vendors.orders.list(token!),
    enabled: Boolean(token),
  })

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
    await queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] })
  }

  return (
    <DeskShell title="Orders">
      <Text className="text-mute text-sm mb-5">
        After PayGate pays, book The Courier Guy from the Sandton hub and walk the mock tracking hops.
      </Text>
      {(orders.data ?? []).map((order) => {
        const parentId = order.orderId ?? order.order?.id ?? order.id
        const shipment = order.shipments?.[0]
        return (
          <View key={order.id} className="bg-panel rounded-2xl p-4 mb-3">
            <Text className="text-ice font-semibold">Order #{parentId.slice(0, 8)}</Text>
            <Text className="text-mute text-sm mt-1">{formatMoney(order.payoutAmount)} payout</Text>
            <Text className="text-mute text-xs mt-1">{order.status}</Text>
            <View className="flex-row flex-wrap mt-3">
              {statuses.map((status) => (
                <Pressable
                  key={status}
                  className={`rounded-full px-3 py-1 mr-2 mb-2 ${order.status === status ? 'bg-brand' : 'bg-navy'}`}
                  onPress={async () => {
                    setBusyId(parentId)
                    try {
                      await api.vendors.orders.updateStatus(parentId, status, token!)
                      await invalidate()
                    } finally {
                      setBusyId(null)
                    }
                  }}
                >
                  <Text className={`text-xs ${order.status === status ? 'text-white' : 'text-ice'}`}>{status}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              className="mt-2"
              disabled={busyId === order.id}
              onPress={async () => {
                setBusyId(order.id)
                try {
                  await api.vendors.orders.bookCourier(order.id, token!)
                  await invalidate()
                } finally {
                  setBusyId(null)
                }
              }}
            >
              <Text className="text-glow">Book Courier Guy ECO</Text>
            </Pressable>
            {shipment ? (
              <Pressable
                className="mt-2"
                onPress={async () => {
                  setBusyId(shipment.id)
                  try {
                    await api.shipping.advance(shipment.id, token!)
                    await invalidate()
                  } finally {
                    setBusyId(null)
                  }
                }}
              >
                <Text className="text-ice">Advance tracking · {shipment.status}</Text>
              </Pressable>
            ) : null}
          </View>
        )
      })}
      {!orders.data?.length ? <Text className="text-mute">No orders yet.</Text> : null}
    </DeskShell>
  )
}
