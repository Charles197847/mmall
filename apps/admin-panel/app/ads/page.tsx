'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatMoney } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'

const filters = ['all', 'DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED'] as const

export default function AdminAdsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('all')
  const { data, isLoading } = useQuery({
    queryKey: ['admin-ads', filter],
    queryFn: () => api.admin.ads.list({ status: filter }),
  })

  if (isLoading) return <div className="text-slate-500">Loading campaigns...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ads & campaigns</h1>
        <div className="flex gap-2">
          {filters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-[40rem] w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-3">Vendor</th>
              <th className="p-3">Campaign</th>
              <th className="p-3">Slot</th>
              <th className="p-3">Status</th>
              <th className="p-3">Price</th>
              <th className="p-3">Impr.</th>
              <th className="p-3">Clicks</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items ?? []).map((campaign) => (
              <tr key={campaign.id} className="border-t">
                <td className="p-3">{campaign.vendor?.storeName ?? campaign.vendorId}</td>
                <td className="p-3">{campaign.title}</td>
                <td className="p-3">{campaign.slot.replaceAll('_', ' ')}</td>
                <td className="p-3">{campaign.status}</td>
                <td className="p-3">{formatMoney(campaign.price)}</td>
                <td className="p-3">{campaign.impressions}</td>
                <td className="p-3">{campaign.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.items?.length ? <p className="p-4 text-slate-500">No campaigns yet.</p> : null}
      </div>
    </div>
  )
}
