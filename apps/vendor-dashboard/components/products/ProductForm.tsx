'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useForm } from 'react-hook-form'
import type { Product } from '@shopping-mall/shared-types'
import { uploadImage } from '../../lib/uploadImage'

export type ProductFormData = {
  name: string
  description: string
  price: number
  comparePrice?: number
  inventory: number
  category: string
  tags: string[]
  images: string[]
}

type FormValues = {
  name: string
  description: string
  price: number
  comparePrice?: number
  inventory: number
  category: string
  tags: string
}

interface ProductFormProps {
  initialData?: Product | null
  onSubmit: (data: ProductFormData) => Promise<void> | void
  onCancel: () => void
}

export function ProductForm({ initialData, onSubmit, onCancel }: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price ?? 0,
      comparePrice: initialData?.comparePrice ?? undefined,
      inventory: initialData?.inventory ?? 0,
      category: initialData?.category ?? '',
      tags: initialData?.tags?.join(', ') ?? '',
    },
  })

  const addUrls = (urls: string[]) => {
    setImages((current) => [...current, ...urls].slice(0, 5))
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true)
    setUploadError('')
    try {
      const urls = await Promise.all(acceptedFiles.map(uploadImage))
      addUrls(urls)
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload images.')
    } finally {
      setUploading(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
    maxFiles: 5,
    disabled: uploading || images.length >= 5,
  })

  const addImageUrl = () => {
    const url = imageUrl.trim()
    if (!url) return
    addUrls([url])
    setImageUrl('')
  }

  const handleFormSubmit = async (data: FormValues) => {
    const tags = data.tags
      ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : []
    const comparePrice =
      typeof data.comparePrice === 'number' && Number.isFinite(data.comparePrice) && data.comparePrice > 0
        ? data.comparePrice
        : undefined
    await onSubmit({
      name: data.name,
      description: data.description,
      price: Number(data.price),
      comparePrice,
      inventory: Number(data.inventory),
      category: data.category,
      tags,
      images,
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-5 bg-white p-6 rounded-lg shadow w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold">{initialData?.id ? 'Edit Product' : 'Add New Product'}</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Product Name *</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.name ? <p className="text-red-500 text-sm">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.description ? <p className="text-red-500 text-sm">{errors.description.message}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price ($) *</label>
            <input
              type="number"
              step="0.01"
              {...register('price', { required: 'Price is required', valueAsNumber: true, min: 0.01 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.price ? <p className="text-red-500 text-sm">{errors.price.message}</p> : null}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Compare Price ($)</label>
            <input
              type="number"
              step="0.01"
              {...register('comparePrice', { valueAsNumber: true, min: 0 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Inventory *</label>
          <input
            type="number"
            {...register('inventory', { required: 'Inventory is required', valueAsNumber: true, min: 0 })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.inventory ? <p className="text-red-500 text-sm">{errors.inventory.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <input
            {...register('category')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Electronics"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            {...register('tags')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., new, sale, premium"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Images</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? <p>Uploading...</p> : <p>Drag and drop images here, or click to select (max 5)</p>}
          </div>
          <div className="flex gap-2 mt-3">
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="Or paste an image URL"
            />
            <button type="button" onClick={addImageUrl} className="px-3 py-2 border rounded-lg hover:bg-gray-50">
              Add URL
            </button>
          </div>
          {uploadError ? <p className="text-red-500 text-sm mt-2">{uploadError}</p> : null}
          <div className="flex flex-wrap gap-2 mt-3">
            {images.map((url, index) => (
              <div key={`${url}-${index}`} className="relative w-20 h-20">
                <img src={url} alt={`Product ${index + 1}`} className="w-full h-full object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
