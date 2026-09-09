'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { MetricCard } from '../../components/dashboard/MetricCard'
import { RevenueChart } from '../../components/dashboard/RevenueChart'
import { RecentOrders } from '../../components/dashboard/RecentOrders'

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.admin.stats.get(),
    staleTime: 60_000,
  })

  const { data: revenueData } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => api.admin.stats.revenue(),
    staleTime: 60_000,
  })

  if (isLoading) return <div className="text-slate-500">Loading dashboard...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 tracking-tight">MMall control plane</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={`R${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          change={stats?.revenueGrowth}
        />
        <MetricCard title="Total Orders" value={stats?.totalOrders ?? 0} change={stats?.orderGrowth} />
        <MetricCard
          title="Active Vendors"
          value={stats?.activeVendors ?? 0}
          subtext={`${stats?.pendingVendors ?? 0} pending approval`}
        />
        <MetricCard title="Total Products" value={stats?.totalProducts ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <RecentOrders orders={stats?.recentOrders} />
      </div>
    </div>
  )
}
