'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { OrderStatus } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'

const statuses: Array<OrderStatus | 'all'> = [
  'all',
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
]

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<(typeof statuses)[number]>('all')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', filter],
    queryFn: () => api.admin.orders.list({ status: filter }),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.admin.orders.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  if (isLoading) return <div className="text-slate-500">Loading orders...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Oversight</h1>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === status ? 'bg-slate-900 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-semibold">#{order.id.slice(0, 8)}</p>
                <p className="text-sm text-slate-500">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                </p>
                <p className="text-sm">
                  {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Customer'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">R{order.totalAmount.toFixed(2)}</p>
                <p className="text-xs text-slate-500">Payment: {order.paymentStatus}</p>
              </div>
              <select
                className="border rounded px-2 py-1 h-9"
                value={order.status}
                onChange={(event) => updateStatus.mutate({ id: order.id, status: event.target.value })}
              >
                {statuses
                  .filter((status) => status !== 'all')
                  .map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
              </select>
            </div>
            <ul className="mt-3 text-sm text-slate-600 space-y-1">
              {order.items?.map((item) => (
                <li key={item.id}>
                  {item.quantity}x {item.product?.name ?? 'Product'} – R{item.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {!orders?.length ? <p className="text-slate-500">No orders match this filter.</p> : null}
      </div>
    </div>
  )
}
