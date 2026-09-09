'use client'

import { useQuery } from '@tanstack/react-query'
import { formatMoney } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'

export default function FeesPage() {
  const { data: pricing, isLoading } = useQuery({
    queryKey: ['vendor-pricing'],
    queryFn: () => api.vendors.pricing(),
  })

  if (isLoading || !pricing) {
    return <div className="text-slate-500">Loading fee structure...</div>
  }

  const fashionNet = 1000 - 1000 * 0.15 - (1000 * (pricing.gatewayPercent / 100) + pricing.gatewayFixed)

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing & fees</h1>
        <p className="text-mute mt-1">How your MMall shop is billed and how each sale is settled.</p>
      </div>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-2">Store subscription</h2>
        <p className="text-3xl font-bold">{formatMoney(pricing.monthlyPlatformFee, pricing.currency)} / month</p>
        <p className="text-sm text-slate-500 mt-2">
          Unlimited listings, full dashboard, catalog tools, order processing, analytics, and store branding.
        </p>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Category commissions</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b">
              <th className="pb-2">Category</th>
              <th className="pb-2">Rate</th>
              <th className="pb-2">Examples</th>
            </tr>
          </thead>
          <tbody>
            {pricing.categoryCommissions.map((band) => (
              <tr key={band.id} className="border-b last:border-0">
                <td className="py-2 font-medium">{band.label}</td>
                <td className="py-2">{band.rate}%</td>
                <td className="py-2 text-slate-500">{band.examples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-2">
        <h2 className="font-semibold">Payment processing</h2>
        <p className="text-sm">
          Gateway fee: {pricing.gatewayPercent}% + {formatMoney(pricing.gatewayFixed, pricing.currency)} per customer
          transaction.
        </p>
        <p className="text-sm">
          Withdrawal fee: {formatMoney(pricing.withdrawalFee, pricing.currency)} per payout batch to your bank account.
        </p>
        <p className="text-sm">
          Minimum payout: {formatMoney(pricing.minPayoutAmount, pricing.currency)}.
        </p>
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-3">Example: {formatMoney(1000, pricing.currency)} Fashion sale</h2>
        <ul className="text-sm space-y-1 text-slate-600">
          <li>Gross customer payment: {formatMoney(1000, pricing.currency)}</li>
          <li>Platform commission (15%): −{formatMoney(150, pricing.currency)}</li>
          <li>
            Gateway fee ({pricing.gatewayPercent}% + {formatMoney(pricing.gatewayFixed, pricing.currency)}): −
            {formatMoney(1000 * (pricing.gatewayPercent / 100) + pricing.gatewayFixed, pricing.currency)}
          </li>
          <li className="font-semibold text-slate-900">
            Net credited to merchant: {formatMoney(fashionNet, pricing.currency)}
          </li>
        </ul>
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-2">
        <h2 className="font-semibold">AI Studio & ads</h2>
        <p className="text-sm">5 free logo generations, then {formatMoney(pricing.logoGenerationPrice, pricing.currency)} (~$15) each.</p>
        <p className="text-sm">5 free banner generations, then {formatMoney(pricing.bannerGenerationPrice, pricing.currency)} (~$30) each.</p>
        <p className="text-sm">Homepage banner slot: {formatMoney(pricing.homepageBannerWeeklyPrice, pricing.currency)} / week.</p>
        <p className="text-sm">
          Targeted push blast: {formatMoney(pricing.pushBlastMinPrice, pricing.currency)}–
          {formatMoney(pricing.pushBlastMaxPrice, pricing.currency)} for {pricing.pushBlastAudience.toLocaleString()} users.
        </p>
      </section>
    </div>
  )
}
