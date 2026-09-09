'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Role } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'

const roles: Role[] = ['CUSTOMER', 'VENDOR', 'ADMIN']

export default function UsersPage() {
  const queryClient = useQueryClient()
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.admin.users.list(),
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => api.admin.users.updateRole(id, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  if (isLoading) return <div className="text-slate-500">Loading users...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Name</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Role</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Store</th>
              <th className="text-left p-3 text-sm font-medium text-gray-500">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users?.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-3 text-sm">{user.email}</td>
                <td className="p-3">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={user.role}
                    onChange={(event) => roleMutation.mutate({ id: user.id, role: event.target.value as Role })}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-sm text-slate-500">{user.vendorProfile?.storeName ?? '—'}</td>
                <td className="p-3 text-sm text-slate-500">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
