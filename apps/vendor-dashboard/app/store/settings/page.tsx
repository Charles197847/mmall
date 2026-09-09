'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useVendor } from '../../../hooks/useVendor'
import { api } from '../../../lib/api'

interface StoreSettings {
  storeName: string
  description: string
  settings: {
    theme: {
      primaryColor: string
      secondaryColor: string
      fontFamily: string
    }
  }
}

const defaultTheme = {
  primaryColor: '#2563eb',
  secondaryColor: '#6b7280',
  fontFamily: 'Inter',
}

export default function StoreSettingsPage() {
  const { vendor, refetch, isLoading } = useVendor()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<StoreSettings>()

  const primaryColor = watch('settings.theme.primaryColor')
  const secondaryColor = watch('settings.theme.secondaryColor')

  useEffect(() => {
    if (!vendor) return
    reset({
      storeName: vendor.storeName || '',
      description: vendor.description || '',
      settings: {
        theme: {
          primaryColor: vendor.settings?.theme?.primaryColor ?? defaultTheme.primaryColor,
          secondaryColor: vendor.settings?.theme?.secondaryColor ?? defaultTheme.secondaryColor,
          fontFamily: vendor.settings?.theme?.fontFamily ?? defaultTheme.fontFamily,
        },
      },
    })
  }, [vendor, reset])

  const onSubmit = async (data: StoreSettings) => {
    setSaving(true)
    setMessage('')
    try {
      await api.vendors.update({
        storeName: data.storeName,
        description: data.description,
        settings: {
          theme: data.settings.theme,
          banner: vendor?.settings?.banner ?? null,
          socialLinks: vendor?.settings?.socialLinks ?? {},
        },
      })
      await refetch()
      setMessage('Settings updated successfully.')
    } catch {
      setMessage('Failed to update settings.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !vendor) {
    return <div className="text-slate-500">Loading store settings...</div>
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Store Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Store Name</label>
          <input
            {...register('storeName', { required: 'Store name is required' })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {errors.storeName ? <p className="text-red-500 text-sm">{errors.storeName.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex items-center gap-3">
              <input {...register('settings.theme.primaryColor')} type="color" className="w-12 h-12 rounded border cursor-pointer" />
              <span className="text-sm text-slate-500">{primaryColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Secondary Color</label>
            <div className="flex items-center gap-3">
              <input {...register('settings.theme.secondaryColor')} type="color" className="w-12 h-12 rounded border cursor-pointer" />
              <span className="text-sm text-slate-500">{secondaryColor}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Font Family</label>
          <select
            {...register('settings.theme.fontFamily')}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Poppins">Poppins</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        <div className="rounded-lg border p-4" style={{ borderColor: primaryColor }}>
          <p className="text-sm text-slate-500 mb-2">Preview</p>
          <p className="font-semibold" style={{ color: primaryColor, fontFamily: watch('settings.theme.fontFamily') }}>
            {watch('storeName') || vendor.storeName}
          </p>
          <p className="text-sm" style={{ color: secondaryColor }}>
            {watch('description') || 'Your store description appears here.'}
          </p>
        </div>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="text-white px-6 py-2 rounded-lg disabled:opacity-50"
          style={{ backgroundColor: primaryColor || defaultTheme.primaryColor }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
