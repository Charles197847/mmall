'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Product } from '@shopping-mall/shared-types'
import { ProductTable } from '../../components/products/ProductTable'
import { ProductForm, type ProductFormData } from '../../components/products/ProductForm'
import { api } from '../../lib/api'

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => api.vendors.products.list(),
  })

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['vendor-products'] })
    void queryClient.invalidateQueries({ queryKey: ['vendor-analytics'] })
  }

  const createMutation = useMutation({
    mutationFn: (body: ProductFormData) => api.vendors.products.create(body),
    onSuccess: () => {
      invalidate()
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductFormData }) => api.vendors.products.update(id, data),
    onSuccess: () => {
      invalidate()
      setEditingProduct(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: api.vendors.products.delete,
    onSuccess: invalidate,
  })

  const submit = async (form: ProductFormData) => {
    if (editingProduct) {
      await updateMutation.mutateAsync({ id: editingProduct.id, data: form })
    } else {
      await createMutation.mutateAsync(form)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button type="button" onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Add Product
        </button>
      </div>
      <ProductTable products={data?.items} onEdit={setEditingProduct} onDelete={(id) => deleteMutation.mutate(id)} />
      {showForm || editingProduct ? (
        <ProductForm
          initialData={editingProduct}
          onSubmit={submit}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      ) : null}
    </div>
  )
}
