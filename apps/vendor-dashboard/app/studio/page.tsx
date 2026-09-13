'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatMoney, type GenerationAssetType, type GenerationJob } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'
import { useVendor } from '../../hooks/useVendor'
import { KycActionNotice, KycBanner } from '../../components/kyc/KycBanner'

export default function StudioPage() {
  const queryClient = useQueryClient()
  const { kyc } = useVendor()
  const [assetType, setAssetType] = useState<GenerationAssetType>('LOGO')
  const [prompt, setPrompt] = useState('Minimal electric-blue mark for a premium marketplace shop named MMall Studio')
  const [selected, setSelected] = useState<GenerationJob | null>(null)
  const [message, setMessage] = useState('')

  const { data: quotaData } = useQuery({
    queryKey: ['studio-quota'],
    queryFn: () => api.studio.quota(),
  })
  const { data: jobsData } = useQuery({
    queryKey: ['studio-jobs'],
    queryFn: () => api.studio.jobs(),
  })
  const { data: pricing } = useQuery({
    queryKey: ['vendor-pricing'],
    queryFn: () => api.vendors.pricing(),
  })

  const quota = quotaData?.items.find((item) => item.assetType === assetType)
  const jobs = useMemo(
    () => (jobsData?.items ?? []).filter((job) => job.assetType === assetType),
    [jobsData, assetType],
  )
  const unitPrice = quota?.unitPrice ?? (assetType === 'LOGO' ? 299 : 599)
  const currency = pricing?.currency ?? 'ZAR'

  const generate = useMutation({
    mutationFn: () => api.studio.generate({ assetType, prompt }),
    onSuccess: (result) => {
      setSelected(result.job)
      setMessage(result.job.billedAs === 'FREE' ? 'Used one free generation.' : 'Charged one paid credit.')
      void queryClient.invalidateQueries({ queryKey: ['studio-quota'] })
      void queryClient.invalidateQueries({ queryKey: ['studio-jobs'] })
    },
    onError: (error: Error) => setMessage(error.message),
  })

  const topup = useMutation({
    mutationFn: (quantity: number) => api.studio.topup({ assetType, quantity }),
    onSuccess: (result) => {
      setMessage(`Added credits. Charged ${formatMoney(result.charged, result.currency)}.`)
      void queryClient.invalidateQueries({ queryKey: ['studio-quota'] })
    },
    onError: (error: Error) => setMessage(error.message),
  })

  const apply = useMutation({
    mutationFn: (jobId: string) => api.studio.apply({ jobId }),
    onSuccess: () => setMessage(assetType === 'LOGO' ? 'Applied as store logo.' : 'Applied as store banner.'),
    onError: (error: Error) => setMessage(error.message),
  })

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Studio</h1>
        <p className="text-mute mt-1">
          Five free high-resolution generations per asset type. Extra logos are {formatMoney(pricing?.logoGenerationPrice ?? 299, currency)}{' '}
          (~$15) and banners {formatMoney(pricing?.bannerGenerationPrice ?? 599, currency)} (~$30).
        </p>
      </div>
      <KycBanner kyc={kyc} />
      {generate.isError ? <KycActionNotice error={generate.error} /> : null}
      {topup.isError ? <KycActionNotice error={topup.error} /> : null}

      <div className="flex gap-2">
        {(['LOGO', 'BANNER'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setAssetType(type)
              setSelected(null)
              setMessage('')
            }}
            className={`px-4 py-2 rounded-lg text-sm ${assetType === type ? 'bg-brand text-white' : 'bg-panel text-mute'}`}
          >
            {type === 'LOGO' ? 'Logo' : 'Banner'}
          </button>
        ))}
      </div>

      <section className="bg-white rounded-lg shadow p-6 grid gap-4 md:grid-cols-3">
        <div>
          <p className="text-sm text-slate-500">Free remaining</p>
          <p className="text-2xl font-bold">
            {quota?.freeRemaining ?? 5}/{quota?.freeLimit ?? 5}
          </p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Paid credits</p>
          <p className="text-2xl font-bold">{quota?.paidCredits ?? 0}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Overage</p>
          <p className="text-2xl font-bold">{formatMoney(unitPrice, currency)}</p>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-6 space-y-4">
        <label className="block text-sm font-medium">Prompt</label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={generate.isPending}
            onClick={() => {
              setMessage('')
              generate.mutate()
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {generate.isPending ? 'Generating...' : 'Generate'}
          </button>
          <button
            type="button"
            disabled={topup.isPending}
            onClick={() => topup.mutate(1)}
            className="px-4 py-2 rounded-lg border"
          >
            Buy 1 credit · {formatMoney(unitPrice, currency)}
          </button>
          <button
            type="button"
            disabled={topup.isPending}
            onClick={() => topup.mutate(5)}
            className="px-4 py-2 rounded-lg border"
          >
            Buy 5 credits · {formatMoney(unitPrice * 5, currency)}
          </button>
        </div>
        {message ? <p className="text-sm text-slate-600">{message}</p> : null}
      </section>

      {selected ? (
        <section className="bg-white rounded-lg shadow p-6 space-y-3">
          <p className="text-sm text-slate-500">
            Latest · {selected.provider} · {selected.billedAs.toLowerCase()}
          </p>
          <img src={selected.imageUrl} alt={selected.prompt} className="w-full max-h-96 object-contain rounded-lg bg-slate-100" />
          <button
            type="button"
            disabled={apply.isPending}
            onClick={() => apply.mutate(selected.id)}
            className="bg-brand text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {apply.isPending ? 'Applying...' : assetType === 'LOGO' ? 'Use as store logo' : 'Use as store banner'}
          </button>
        </section>
      ) : null}

      {jobs.length ? (
        <section>
          <h2 className="font-semibold mb-3">Recent generations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {jobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelected(job)}
                className="bg-white rounded-lg shadow overflow-hidden text-left"
              >
                <img src={job.imageUrl} alt="" className="w-full h-28 object-cover bg-slate-100" />
                <p className="p-2 text-xs text-slate-500 truncate">{job.prompt}</p>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
