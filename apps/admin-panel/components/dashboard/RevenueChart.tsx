'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function RevenueChart({
  data,
}: {
  data?: Array<{ date?: string; createdAt: string; totalAmount: number }>
}) {
  const chartData = (data ?? []).map((row) => ({
    date: (row.date ?? row.createdAt).slice(0, 10),
    sales: row.totalAmount,
  }))

  return (
    <div className="mm-card rounded-2xl p-6">
      <h3 className="font-bold mb-4 text-ice">Revenue (30 days)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(61,232,255,0.12)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8BA0C9' }} />
          <YAxis tick={{ fill: '#8BA0C9' }} />
          <Tooltip
            contentStyle={{ background: '#122044', border: '1px solid rgba(61,232,255,0.2)', color: '#E8EEFC' }}
          />
          <Bar dataKey="sales" fill="#2F6BFF" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
