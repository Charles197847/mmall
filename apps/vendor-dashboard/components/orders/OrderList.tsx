'use client'

import { useState } from 'react'
import * as Select from '@radix-ui/react-select'
import type { VendorOrderRow, VendorOrderStatus } from '@shopping-mall/shared-types'
import { formatMoney } from '@shopping-mall/shared-types'

const statusOptions: VendorOrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

function Chevron({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      {direction === 'down' ? (
        <path d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08z" />
      ) : (
        <path d="M14.77 12.79a.75.75 0 0 1-1.06-.02L10 9.06l-3.71 3.71a.75.75 0 1 1-1.06-1.06l4.24-4.24a.75.75 0 0 1 1.06 0l4.24 4.24a.75.75 0 0 1 .02 1.06z" />
      )}
    </svg>
  )
}

interface OrderListProps {
  orders?: VendorOrderRow[]
  onUpdateStatus: (orderId: string, newStatus: string) => Promise<void>
  onBookCourier?: (vendorOrderId: string) => Promise<void>
  onAdvanceShipment?: (shipmentId: string) => Promise<void>
  busyId?: string | null
}

export function OrderList({ orders, onUpdateStatus, onBookCourier, onAdvanceShipment, busyId }: OrderListProps) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleStatusChange = async (parentOrderId: string, status: string) => {
    setUpdating(parentOrderId)
    try {
      await onUpdateStatus(parentOrderId, status)
    } finally {
      setUpdating(null)
    }
  }

  if (!orders?.length) {
    return <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">No orders yet.</div>
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const parentOrderId = order.orderId ?? order.order?.id ?? order.id
        const customer = order.order?.customer
        return (
          <div key={order.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap justify-between items-start gap-3">
              <div>
                <p className="font-semibold">Order #{parentOrderId.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">
                  {order.order?.createdAt ? new Date(order.order.createdAt).toLocaleDateString() : '—'}
                </p>
                <p className="text-sm">
                  {customer ? `${customer.firstName} ${customer.lastName}` : 'Customer'}
                </p>
                {customer?.email ? <p className="text-sm text-gray-500">{customer.email}</p> : null}
              </div>

              <div className="text-right">
                <p className="font-bold text-lg">{formatMoney(order.payoutAmount)}</p>
                <p className="text-sm text-gray-500">Commission: {formatMoney(order.commission)}</p>
                {order.gatewayFee ? (
                  <p className="text-sm text-gray-500">Gateway: {formatMoney(order.gatewayFee)}</p>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] ?? ''}`}>
                  {order.status}
                </span>

                <Select.Root
                  value={order.status}
                  onValueChange={(value) => void handleStatusChange(parentOrderId, value)}
                  disabled={updating === parentOrderId}
                >
                  <Select.Trigger className="inline-flex items-center justify-between gap-2 px-3 py-1 border rounded-lg text-sm bg-white hover:bg-gray-50">
                    <Select.Value placeholder="Update status" />
                    <Select.Icon>
                      <Chevron direction="down" />
                    </Select.Icon>
                  </Select.Trigger>
                  <Select.Portal>
                    <Select.Content className="bg-white rounded-lg shadow-lg border p-1 z-50" position="popper">
                      <Select.ScrollUpButton className="flex items-center justify-center h-6">
                        <Chevron direction="up" />
                      </Select.ScrollUpButton>
                      <Select.Viewport>
                        {statusOptions.map((status) => (
                          <Select.Item
                            key={status}
                            value={status}
                            className="px-3 py-2 text-sm rounded cursor-pointer data-[highlighted]:bg-gray-100 data-[state=checked]:font-medium"
                          >
                            <Select.ItemText>{status}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                      <Select.ScrollDownButton className="flex items-center justify-center h-6">
                        <Chevron direction="down" />
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>
                {updating === parentOrderId ? <span className="text-sm text-gray-400">Updating...</span> : null}
              </div>
            </div>

            <div className="mt-3 border-t pt-3">
              <p className="text-sm font-medium">Items:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {order.order?.items?.map((item) => (
                  <li key={item.id}>
                    {item.quantity}x {item.product?.name ?? 'Product'} – R{item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {order.trackingNumber ? (
                  <p className="text-sm text-slate-600">
                    Courier Guy {order.trackingNumber} · {order.shipments?.[0]?.status.replaceAll('_', ' ')}
                  </p>
                ) : (
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg bg-brand text-white text-sm"
                    disabled={busyId === order.id}
                    onClick={() => void onBookCourier?.(order.id)}
                  >
                    Book Courier Guy collection
                  </button>
                )}
                {order.shipments?.[0] && order.shipments[0].status !== 'DELIVERED' ? (
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg border text-sm"
                    disabled={busyId === order.shipments[0].id}
                    onClick={() => void onAdvanceShipment?.(order.shipments![0].id)}
                  >
                    Simulate next hop
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
