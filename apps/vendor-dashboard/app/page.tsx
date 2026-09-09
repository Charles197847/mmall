'use client'

import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useVendor } from '../hooks/useVendor'
import { api } from '../lib/api'
import { MetricCard } from '../components/dashboard/MetricCard'

export default function DashboardPage() {
  const { vendor } = useVendor()
  const { data: stats, isLoading } = useQuery({
    queryKey: ['vendor-analytics'],
    queryFn: () => api.vendors.analytics(),
    enabled: Boolean(vendor),
    staleTime: 60_000,
  })

  if (isLoading) return <div className="text-slate-500">Loading dashboard...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Store pulse</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Revenue" value={`R${(stats?.totalRevenue ?? 0).toFixed(2)}`} />
        <MetricCard title="Total Orders" value={stats?.totalOrders ?? 0} />
        <MetricCard title="Total Products" value={stats?.totalProducts ?? 0} />
        <MetricCard
          title="Pending Orders"
          value={stats?.pendingOrders ?? 0}
          change={(stats?.pendingOrders ?? 0) > 0 ? 'waiting' : undefined}
        />
      </div>

      <div className="mm-card rounded-2xl p-6">
        <h3 className="font-bold mb-4 text-ice">Recent sales (last 7 days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.salesTrend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,232,255,0.12)" />
            <XAxis dataKey="date" tick={{ fill: '#8BA0C9' }} />
            <YAxis tick={{ fill: '#8BA0C9' }} />
            <Tooltip
              contentStyle={{ background: '#122044', border: '1px solid rgba(61,232,255,0.2)', color: '#E8EEFC' }}
            />
            <Bar dataKey="sales" fill="#2F6BFF" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
