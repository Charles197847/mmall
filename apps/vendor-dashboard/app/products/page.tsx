'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Product } from '@shopping-mall/shared-types'
import { ProductTable } from '../../components/products/ProductTable'
import { ProductForm, type ProductFormData } from '../../components/products/ProductForm'
import { api } from '../../lib/api'
import { useVendor } from '../../hooks/useVendor'
import { KycActionNotice, KycBanner } from '../../components/kyc/KycBanner'

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formError, setFormError] = useState<unknown>(null)
  const queryClient = useQueryClient()
  const { kyc } = useVendor()

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
    setFormError(null)
    try {
      if (editingProduct) {
        await updateMutation.mutateAsync({ id: editingProduct.id, data: form })
      } else {
        await createMutation.mutateAsync(form)
      }
    } catch (error) {
      setFormError(error)
      throw error
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
      <KycBanner kyc={kyc} />
      {formError ? <div className="mb-4"><KycActionNotice error={formError} /></div> : null}
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
