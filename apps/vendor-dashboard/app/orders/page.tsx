'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { OrderList } from '../../components/orders/OrderList'

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const { data: orders } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => api.vendors.orders.list(),
  })

  const updateStatus = async (orderId: string, status: string) => {
    await api.vendors.orders.updateStatus(orderId, { status })
    await queryClient.invalidateQueries({ queryKey: ['vendor-orders'] })
    await queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <OrderList orders={orders} onUpdateStatus={updateStatus} />
    </div>
  )
}
