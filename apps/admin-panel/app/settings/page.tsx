'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PlatformSettings } from '@shopping-mall/shared-types'
import { formatMoney } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'

const emptySettings: PlatformSettings = {
  defaultCommission: 10,
  minPayoutAmount: 10,
  currency: 'ZAR',
  shippingDefault: 0,
  monthlyPlatformFee: 599,
  gatewayPercent: 2.5,
  gatewayFixed: 2,
  withdrawalFee: 10,
  categoryCommissions: [],
  logoGenerationPrice: 299,
  bannerGenerationPrice: 599,
  homepageBannerWeeklyPrice: 1500,
  searchFeatureWeeklyPrice: 900,
  shopHighlightWeeklyPrice: 600,
  pushBlastMinPrice: 5000,
  pushBlastMaxPrice: 10000,
  pushBlastAudience: 200000,
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [settings, setSettings] = useState<PlatformSettings>(emptySettings)
  const [message, setMessage] = useState('')

  const { data: currentSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => api.admin.settings.get(),
  })

  useEffect(() => {
    if (currentSettings) setSettings(currentSettings)
  }, [currentSettings])

  const updateSettings = useMutation({
    mutationFn: (data: PlatformSettings) => api.admin.settings.update(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      setMessage('Settings updated successfully.')
    },
    onError: () => setMessage('Failed to update settings.'),
  })

  const exampleNet = 1000 - 1000 * 0.15 - (1000 * (settings.gatewayPercent / 100) + settings.gatewayFixed)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Merchant Pricing & Fees</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setMessage('')
          updateSettings.mutate(settings)
        }}
        className="space-y-6"
      >
        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold">Store subscription</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Monthly platform fee</label>
            <input
              type="number"
              min={0}
              value={settings.monthlyPlatformFee}
              onChange={(event) => setSettings({ ...settings, monthlyPlatformFee: Number(event.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Billed monthly per shop. Product listings stay unlimited.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={settings.currency}
              onChange={(event) => setSettings({ ...settings, currency: event.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="ZAR">ZAR (R)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold">Category commissions</h2>
          <p className="text-sm text-gray-500">
            Applied to the gross item price. Unmapped categories use the {settings.defaultCommission}% fallback.
          </p>
          {settings.categoryCommissions.map((band, index) => (
            <div key={band.id} className="grid grid-cols-[1fr_100px] gap-3 items-center">
              <div>
                <p className="text-sm font-medium">{band.label}</p>
                <p className="text-xs text-gray-500">{band.examples}</p>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={band.rate}
                onChange={(event) => {
                  const next = [...settings.categoryCommissions]
                  next[index] = { ...band, rate: Number(event.target.value) }
                  setSettings({ ...settings, categoryCommissions: next })
                }}
                className="px-3 py-2 border rounded-lg"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1">Fallback commission (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={settings.defaultCommission}
              onChange={(event) => setSettings({ ...settings, defaultCommission: Number(event.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold">Payment processing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gateway percent (%)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={settings.gatewayPercent}
                onChange={(event) => setSettings({ ...settings, gatewayPercent: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gateway fixed fee</label>
              <input
                type="number"
                min={0}
                value={settings.gatewayFixed}
                onChange={(event) => setSettings({ ...settings, gatewayFixed: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Withdrawal fee / payout</label>
              <input
                type="number"
                min={0}
                value={settings.withdrawalFee}
                onChange={(event) => setSettings({ ...settings, withdrawalFee: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimum payout</label>
              <input
                type="number"
                min={0}
                value={settings.minPayoutAmount}
                onChange={(event) => setSettings({ ...settings, minPayoutAmount: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Example: a {formatMoney(1000, settings.currency)} Fashion sale credits the merchant{' '}
            {formatMoney(exampleNet, settings.currency)} after commission and gateway fees.
          </p>
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold">AI generation overages</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Logo generation</label>
              <input
                type="number"
                min={0}
                value={settings.logoGenerationPrice}
                onChange={(event) => setSettings({ ...settings, logoGenerationPrice: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">After 5 free logos. Default R299 / $15.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Banner generation</label>
              <input
                type="number"
                min={0}
                value={settings.bannerGenerationPrice}
                onChange={(event) => setSettings({ ...settings, bannerGenerationPrice: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">After 5 free banners. Default R599 / $30.</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="font-semibold">Ad slot pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Homepage banner / week</label>
              <input
                type="number"
                min={0}
                value={settings.homepageBannerWeeklyPrice}
                onChange={(event) =>
                  setSettings({ ...settings, homepageBannerWeeklyPrice: Number(event.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Search feature / week</label>
              <input
                type="number"
                min={0}
                value={settings.searchFeatureWeeklyPrice}
                onChange={(event) =>
                  setSettings({ ...settings, searchFeatureWeeklyPrice: Number(event.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Shop highlight / week</label>
              <input
                type="number"
                min={0}
                value={settings.shopHighlightWeeklyPrice}
                onChange={(event) =>
                  setSettings({ ...settings, shopHighlightWeeklyPrice: Number(event.target.value) })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Push blast audience</label>
              <input
                type="number"
                min={1}
                value={settings.pushBlastAudience}
                onChange={(event) => setSettings({ ...settings, pushBlastAudience: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Push blast min</label>
              <input
                type="number"
                min={0}
                value={settings.pushBlastMinPrice}
                onChange={(event) => setSettings({ ...settings, pushBlastMinPrice: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Push blast max</label>
              <input
                type="number"
                min={0}
                value={settings.pushBlastMaxPrice}
                onChange={(event) => setSettings({ ...settings, pushBlastMaxPrice: Number(event.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Default R5,000–R10,000 for 200k users.</p>
            </div>
          </div>
        </section>

        {message ? <p className="text-sm text-slate-600">{message}</p> : null}

        <button
          type="submit"
          disabled={updateSettings.isPending}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  )
}
