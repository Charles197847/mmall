'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { OrderList } from '../../components/orders/OrderList'

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const [busyId, setBusyId] = useState<string | null>(null)
  const { data: orders } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => api.vendors.orders.list(),
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
    await queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] })
  }

  const updateStatus = async (orderId: string, status: string) => {
    await api.vendors.orders.updateStatus(orderId, { status })
    await invalidate()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Orders</h1>
      <p className="text-mute text-sm mb-6">After PayGate pays, book The Courier Guy from the Sandton hub and walk the mock tracking hops.</p>
      <OrderList
        orders={orders}
        busyId={busyId}
        onUpdateStatus={updateStatus}
        onBookCourier={async (vendorOrderId) => {
          setBusyId(vendorOrderId)
          try {
            await api.vendors.orders.bookCourier(vendorOrderId, { serviceLevelCode: 'ECO' })
            await invalidate()
          } finally {
            setBusyId(null)
          }
        }}
        onAdvanceShipment={async (shipmentId) => {
          setBusyId(shipmentId)
          try {
            await api.shipping.advance(shipmentId)
            await invalidate()
          } finally {
            setBusyId(null)
          }
        }}
      />
    </div>
  )
}
