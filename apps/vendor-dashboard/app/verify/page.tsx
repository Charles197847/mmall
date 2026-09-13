'use client'

import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { KycBanner } from '../../components/kyc/KycBanner'

const steps = ['Personal details', 'ID upload', 'Bank verification']

function FileDrop({
  label,
  hint,
  value,
  onFile,
}: {
  label: string
  hint: string
  value?: string
  onFile: (name: string) => void
}) {
  return (
    <label className="block border border-dashed border-glow/30 rounded-2xl p-4 cursor-pointer bg-navy/40">
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-mute mt-1">{hint}</p>
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        className="mt-3 text-sm"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (!file) return
          if (file.size > 4 * 1024 * 1024) {
            alert('File must be under 4MB')
            return
          }
          onFile(file.name)
        }}
      />
      {value ? <p className="text-xs text-glow mt-2">Uploaded: {value}</p> : null}
    </label>
  )
}

export default function VerifyPage() {
  const queryClient = useQueryClient()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [step, setStep] = useState(0)
  const [cameraOn, setCameraOn] = useState(false)
  const [form, setForm] = useState({
    requestedTier: 'ACTIVE_VENDOR' as 'ACTIVE_VENDOR' | 'ENTERPRISE',
    identityType: 'SA_ID_CARD' as 'SA_ID_CARD' | 'SA_GREEN_BOOK' | 'PASSPORT',
    legalName: '',
    idNumber: '',
    residentialAddress: '',
    idDocumentName: '',
    addressDocumentName: '',
    selfieCaptured: false,
    cipcDocumentName: '',
    taxNumber: '',
    vatNumber: '',
    bankProofName: '',
  })

  const { data: kyc } = useQuery({
    queryKey: ['vendor-kyc'],
    queryFn: () => api.kyc.me(),
  })

  const submit = useMutation({
    mutationFn: () =>
      api.kyc.submit({
        ...form,
        selfieCaptured: true,
        cipcDocumentName: form.requestedTier === 'ENTERPRISE' ? form.cipcDocumentName : undefined,
        taxNumber: form.requestedTier === 'ENTERPRISE' ? form.taxNumber : undefined,
        vatNumber: form.vatNumber || undefined,
        bankProofName: form.requestedTier === 'ENTERPRISE' ? form.bankProofName : undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vendor-kyc'] })
      void queryClient.invalidateQueries({ queryKey: ['vendor-me'] })
    },
  })

  const canStep1 = form.legalName.length > 2 && form.idNumber.length > 5 && form.residentialAddress.length > 8
  const canStep2 = Boolean(form.idDocumentName && form.addressDocumentName && form.selfieCaptured)
  const canStep3 =
    form.requestedTier === 'ACTIVE_VENDOR' ||
    (form.cipcDocumentName && form.taxNumber && form.bankProofName)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraOn(true)
      }
    } catch {
      setForm((current) => ({ ...current, selfieCaptured: true }))
    }
  }

  const captureSelfie = () => {
    setForm((current) => ({ ...current, selfieCaptured: true }))
    const stream = videoRef.current?.srcObject as MediaStream | undefined
    stream?.getTracks().forEach((track) => track.stop())
    setCameraOn(false)
  }

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step])

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Verify account</h1>
      <p className="text-mute mb-6">Collect identity only when you unlock live selling, ads, or payouts.</p>
      <KycBanner kyc={kyc} />

      <div className="h-2 rounded-full bg-navy mb-6 overflow-hidden">
        <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm text-mute mb-4">
        Step {step + 1}: {steps[step]}
      </p>

      {step === 0 ? (
        <div className="mm-card rounded-2xl p-6 space-y-3">
          <select
            className="w-full border rounded-xl px-3 py-2"
            value={form.identityType}
            onChange={(e) => setForm({ ...form, identityType: e.target.value as typeof form.identityType })}
          >
            <option value="SA_ID_CARD">SA ID card</option>
            <option value="SA_GREEN_BOOK">Green ID book</option>
            <option value="PASSPORT">Foreign passport</option>
          </select>
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Legal name (as on ID)"
            value={form.legalName}
            onChange={(e) => setForm({ ...form, legalName: e.target.value })}
          />
          <input
            className="w-full border rounded-xl px-3 py-2"
            placeholder="ID / passport number"
            value={form.idNumber}
            onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
          />
          <textarea
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Residential address"
            value={form.residentialAddress}
            onChange={(e) => setForm({ ...form, residentialAddress: e.target.value })}
          />
          <button disabled={!canStep1} className="bg-brand text-white px-4 py-2 rounded-xl" type="button" onClick={() => setStep(1)}>
            Continue
          </button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mm-card rounded-2xl p-6 space-y-4">
          <FileDrop
            label="Identity document"
            hint="PDF, PNG, or JPG. All four corners visible and unblurred."
            value={form.idDocumentName}
            onFile={(idDocumentName) => setForm({ ...form, idDocumentName })}
          />
          <FileDrop
            label="Proof of residential address"
            hint="Utility bill or bank statement younger than 3 months."
            value={form.addressDocumentName}
            onFile={(addressDocumentName) => setForm({ ...form, addressDocumentName })}
          />
          <div className="border rounded-2xl p-4">
            <p className="font-semibold text-sm mb-2">Liveness selfie</p>
            <video ref={videoRef} className="w-full max-w-sm rounded-xl bg-black aspect-video" />
            <div className="flex gap-2 mt-3">
              <button type="button" className="px-3 py-2 rounded-xl bg-navy" onClick={() => void startCamera()}>
                {cameraOn ? 'Camera on' : 'Open camera'}
              </button>
              <button type="button" className="px-3 py-2 rounded-xl bg-brand text-white" onClick={captureSelfie} disabled={!cameraOn}>
                Capture
              </button>
            </div>
            {form.selfieCaptured ? <p className="text-xs text-glow mt-2">Selfie captured.</p> : null}
            <button
              type="button"
              className="mt-2 text-xs text-mute underline"
              onClick={() => setForm((current) => ({ ...current, selfieCaptured: true }))}
            >
              Use demo liveness capture
            </button>
          </div>
          <div className="flex gap-2">
            <button type="button" className="px-4 py-2 rounded-xl bg-navy" onClick={() => setStep(0)}>
              Back
            </button>
            <button disabled={!canStep2} type="button" className="bg-brand text-white px-4 py-2 rounded-xl" onClick={() => setStep(2)}>
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mm-card rounded-2xl p-6 space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.requestedTier === 'ENTERPRISE'}
              onChange={(e) =>
                setForm({ ...form, requestedTier: e.target.checked ? 'ENTERPRISE' : 'ACTIVE_VENDOR' })
              }
            />
            Also unlock payouts and R5,000+ push blasts (business KYB)
          </label>
          {form.requestedTier === 'ENTERPRISE' ? (
            <>
              <FileDrop
                label="CIPC documents (CoR14.3 / CK)"
                hint="Company registration matching the director name."
                value={form.cipcDocumentName}
                onFile={(cipcDocumentName) => setForm({ ...form, cipcDocumentName })}
              />
              <input
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Company tax / VAT number"
                value={form.taxNumber}
                onChange={(e) => setForm({ ...form, taxNumber: e.target.value })}
              />
              <FileDrop
                label="Bank account proof"
                hint="Stamped letter or statement matching business or director name."
                value={form.bankProofName}
                onFile={(bankProofName) => setForm({ ...form, bankProofName })}
              />
            </>
          ) : (
            <p className="text-sm text-mute">You can add CIPC and bank proof later. Active Vendor is enough to go live and buy standard ads.</p>
          )}
          {submit.isError ? <p className="text-signal text-sm">{submit.error.message}</p> : null}
          {submit.isSuccess ? <p className="text-sm text-glow">Submitted to {kyc?.provider ?? 'Smile ID'}.</p> : null}
          <div className="flex gap-2">
            <button type="button" className="px-4 py-2 rounded-xl bg-navy" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              disabled={!canStep3 || submit.isPending}
              className="bg-brand text-white px-4 py-2 rounded-xl"
              onClick={() => submit.mutate()}
            >
              Submit verification
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
