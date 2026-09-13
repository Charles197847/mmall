'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'

const filters = ['all', 'pending', 'approved', 'suspended'] as const

function vendorStatus(vendor: { isApproved: boolean; isActive: boolean }) {
  if (!vendor.isApproved) return 'Pending'
  if (!vendor.isActive) return 'Suspended'
  return 'Approved'
}

export default function VendorsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<(typeof filters)[number]>('all')

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['admin-vendors', filter],
    queryFn: () => api.admin.vendors.list({ status: filter }),
    staleTime: 30_000,
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin-vendors'] })
    void queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
  }

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.admin.vendors.approve(id),
    onSuccess: invalidate,
  })

  const suspendMutation = useMutation({
    mutationFn: (id: string) => api.admin.vendors.suspend(id),
    onSuccess: invalidate,
  })

  const unsuspendMutation = useMutation({
    mutationFn: (id: string) => api.admin.vendors.unsuspend(id),
    onSuccess: invalidate,
  })

  const kycMutation = useMutation({
    mutationFn: ({ vendorId, status, rejectionReason }: { vendorId: string; status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) =>
      api.kyc.review(vendorId, { status, rejectionReason }),
    onSuccess: invalidate,
  })

  if (isLoading) return <div className="text-slate-500">Loading vendors...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <div className="flex gap-2">
          {filters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Store</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Owner</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">KYC</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Fees</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Joined</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {vendors?.map((vendor) => {
              const status = vendorStatus(vendor)
              return (
                <tr key={vendor.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {vendor.logo ? <img src={vendor.logo} alt="" className="w-8 h-8 rounded-full object-cover" /> : null}
                      <div>
                        <div className="font-medium">{vendor.storeName}</div>
                        <div className="text-sm text-gray-500">{vendor.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{vendor.user?.email}</div>
                    <div className="text-xs text-gray-500">
                      {vendor.user?.firstName} {vendor.user?.lastName}
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : status === 'Suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">
                    <p className="font-medium">{vendor.kyc?.approvedTier?.replaceAll('_', ' ') ?? 'EXPLORER'}</p>
                    <p className="text-xs text-gray-500">{vendor.kyc?.status ?? 'NOT_STARTED'}</p>
                    {vendor.kyc?.status === 'PENDING' ? (
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                          onClick={() => kycMutation.mutate({ vendorId: vendor.id, status: 'APPROVED' })}
                        >
                          Approve KYC
                        </button>
                        <button
                          type="button"
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                          onClick={() => {
                            const reason = window.prompt(
                              'Rejection reason',
                              'Document unreadable – please re-upload a clearer image of your SA ID',
                            )
                            if (!reason) return
                            kycMutation.mutate({ vendorId: vendor.id, status: 'REJECTED', rejectionReason: reason })
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <a href="/settings" className="text-sm text-blue-600 hover:text-blue-800">
                      Category rates
                    </a>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {!vendor.isApproved ? (
                        <button
                          type="button"
                          onClick={() => approveMutation.mutate(vendor.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Approve
                        </button>
                      ) : null}
                      {vendor.isApproved && vendor.isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Suspend ${vendor.storeName}?`)) {
                              suspendMutation.mutate(vendor.id)
                            }
                          }}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Suspend
                        </button>
                      ) : null}
                      {vendor.isApproved && !vendor.isActive ? (
                        <button
                          type="button"
                          onClick={() => unsuspendMutation.mutate(vendor.id)}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Unsuspend
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
