'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatMoney, type AdSlot } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'

const slots: Array<{ id: AdSlot; label: string; hint: string }> = [
  { id: 'HOMEPAGE_BANNER', label: 'Homepage banner', hint: 'R1,500 / week' },
  { id: 'SEARCH_FEATURE', label: 'Search result feature', hint: 'R900 / week' },
  { id: 'SHOP_HIGHLIGHT', label: 'In-app shop highlight', hint: 'R600 / week' },
  { id: 'PUSH_BLAST', label: 'Targeted push blast', hint: 'R5,000–R10,000 for 200k users' },
]

function localInput(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function AdvertisePage() {
  const queryClient = useQueryClient()
  const start = useMemo(() => new Date(), [])
  const end = useMemo(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), [])
  const [slot, setSlot] = useState<AdSlot>('HOMEPAGE_BANNER')
  const [title, setTitle] = useState('')
  const [headline, setHeadline] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [startsAt, setStartsAt] = useState(localInput(start))
  const [endsAt, setEndsAt] = useState(localInput(end))
  const [audienceSize, setAudienceSize] = useState(200000)
  const [message, setMessage] = useState('')

  const { data: pricing } = useQuery({
    queryKey: ['vendor-pricing'],
    queryFn: () => api.vendors.pricing(),
  })
  const { data: campaigns } = useQuery({
    queryKey: ['vendor-ads'],
    queryFn: () => api.ads.mine(),
  })
  const { data: jobs } = useQuery({
    queryKey: ['studio-jobs'],
    queryFn: () => api.studio.jobs(),
  })

  const currency = pricing?.currency ?? 'ZAR'
  const create = useMutation({
    mutationFn: () =>
      api.ads.create({
        slot,
        title,
        headline: headline || undefined,
        imageUrl: imageUrl || undefined,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        audienceSize: slot === 'PUSH_BLAST' ? audienceSize : undefined,
      }),
    onSuccess: () => {
      setMessage('Draft saved. Purchase to activate the campaign.')
      setTitle('')
      void queryClient.invalidateQueries({ queryKey: ['vendor-ads'] })
    },
    onError: (error: Error) => setMessage(error.message),
  })
  const purchase = useMutation({
    mutationFn: (id: string) => api.ads.purchase(id),
    onSuccess: (campaign) => {
      setMessage(
        campaign.slot === 'PUSH_BLAST'
          ? 'Push blast purchased. Delivery is queued for the scheduled start.'
          : 'Campaign purchased and scheduled.',
      )
      void queryClient.invalidateQueries({ queryKey: ['vendor-ads'] })
    },
    onError: (error: Error) => setMessage(error.message),
  })

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Advertise</h1>
        <p className="text-mute mt-1">Buy slots, attach creatives, and track impressions and clicks.</p>
      </div>

      <section className="grid gap-3 md:grid-cols-2">
        {slots.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSlot(item.id)}
            className={`text-left rounded-lg shadow p-4 ${slot === item.id ? 'bg-brand text-white' : 'bg-white'}`}
          >
            <p className="font-semibold">{item.label}</p>
            <p className={`text-sm mt-1 ${slot === item.id ? 'text-white/80' : 'text-slate-500'}`}>{item.hint}</p>
          </button>
        ))}
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="font-semibold">New campaign</h2>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Campaign title"
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          placeholder="Headline"
          className="w-full px-3 py-2 border rounded-lg"
        />
        <input
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
          placeholder="Creative image URL"
          className="w-full px-3 py-2 border rounded-lg"
        />
        {jobs?.items?.length ? (
          <div className="flex gap-2 overflow-x-auto">
            {jobs.items.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setImageUrl(job.imageUrl)}
                className="shrink-0"
              >
                <img src={job.imageUrl} alt="" className="w-20 h-16 object-cover rounded-lg border" />
              </button>
            ))}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">
            Starts
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </label>
          <label className="text-sm">
            Ends
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </label>
        </div>
        {slot === 'PUSH_BLAST' ? (
          <label className="text-sm block">
            Audience size ({audienceSize.toLocaleString()} users)
            <input
              type="range"
              min={10000}
              max={200000}
              step={10000}
              value={audienceSize}
              onChange={(event) => setAudienceSize(Number(event.target.value))}
              className="mt-2 w-full"
            />
            <p className="text-slate-500 mt-1">
              Scaled between {formatMoney(pricing?.pushBlastMinPrice ?? 5000, currency)} and{' '}
              {formatMoney(pricing?.pushBlastMaxPrice ?? 10000, currency)}.
            </p>
          </label>
        ) : null}
        <button
          type="button"
          disabled={create.isPending || title.length < 3}
          onClick={() => {
            setMessage('')
            create.mutate()
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {create.isPending ? 'Saving...' : 'Save draft'}
        </button>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </section>

      <section className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="p-3">Campaign</th>
              <th className="p-3">Slot</th>
              <th className="p-3">Status</th>
              <th className="p-3">Price</th>
              <th className="p-3">Impr.</th>
              <th className="p-3">Clicks</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {(campaigns?.items ?? []).map((campaign) => {
              const ctr = campaign.impressions ? ((campaign.clicks / campaign.impressions) * 100).toFixed(1) : '0.0'
              return (
                <tr key={campaign.id} className="border-t">
                  <td className="p-3">
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-slate-500">{campaign.headline}</p>
                  </td>
                  <td className="p-3">{campaign.slot.replaceAll('_', ' ')}</td>
                  <td className="p-3">{campaign.status}</td>
                  <td className="p-3">{formatMoney(campaign.price, currency)}</td>
                  <td className="p-3">{campaign.impressions}</td>
                  <td className="p-3">
                    {campaign.clicks} ({ctr}%)
                  </td>
                  <td className="p-3 text-right">
                    {campaign.status === 'DRAFT' ? (
                      <button
                        type="button"
                        disabled={purchase.isPending}
                        onClick={() => purchase.mutate(campaign.id)}
                        className="text-blue-600 font-medium"
                      >
                        Purchase
                      </button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!campaigns?.items?.length ? <p className="p-4 text-slate-500">No campaigns yet.</p> : null}
      </section>
    </div>
  )
}
