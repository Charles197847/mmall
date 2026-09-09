import type { PlatformStats } from '@shopping-mall/shared-types'

export function RecentOrders({ orders }: { orders?: PlatformStats['recentOrders'] }) {
  return (
    <div className="mm-card rounded-2xl p-6">
      <h3 className="font-bold mb-4 text-ice">Recent orders</h3>
      {!orders?.length ? (
        <p className="text-mute text-sm">No orders yet.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-ice">#{order.id.slice(0, 8)}</p>
                <p className="text-mute">
                  {order.customer
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : 'Customer'}{' '}
                  · {order.status}
                </p>
              </div>
              <p className="font-semibold text-glow">R{order.totalAmount.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
