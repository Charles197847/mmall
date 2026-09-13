'use client'

import Link from 'next/link'
import type { KycStatus, KycTier, VendorKyc } from '@shopping-mall/shared-types'

const labels: Record<KycTier, string> = {
  EXPLORER: 'Explorer',
  ACTIVE_VENDOR: 'Active Vendor',
  ENTERPRISE: 'Verified Merchant',
}

export function KycBanner({ kyc }: { kyc: VendorKyc | null | undefined }) {
  if (!kyc) return null

  if (kyc.status === 'APPROVED' && kyc.approvedTier === 'ENTERPRISE') {
    return (
      <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="rounded-full bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 mr-2">Verified Merchant</span>
          Ads, paid AI, and payouts are unlocked.
        </p>
      </div>
    )
  }

  if (kyc.status === 'APPROVED' && kyc.approvedTier === 'ACTIVE_VENDOR') {
    return (
      <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="rounded-full bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 mr-2">Active Vendor</span>
          Live listings, ads, and paid AI are unlocked. Business verification is still required for payouts and R5,000+ blasts.
        </p>
        <Link href="/verify" className="shrink-0 text-sm text-glow font-semibold">
          Unlock payouts
        </Link>
      </div>
    )
  }

  if (kyc.status === 'PENDING') {
    return (
      <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="rounded-full bg-amber-400 text-black text-xs font-semibold px-2 py-0.5 mr-2">Verification Pending</span>
          Usually approved within {kyc.reviewEtaMinutes} minutes.
        </p>
        <Link href="/verify" className="text-sm text-glow font-semibold">
          View status
        </Link>
      </div>
    )
  }

  if (kyc.status === 'REJECTED') {
    return (
      <div className="mb-6 rounded-2xl border border-signal/40 bg-signal/10 px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm">
          <span className="rounded-full bg-signal text-white text-xs font-semibold px-2 py-0.5 mr-2">Rejected</span>
          {kyc.rejectionReason || 'Please re-upload a clearer SA ID.'}
        </p>
        <Link href="/verify" className="text-sm text-glow font-semibold">
          Fix documents
        </Link>
      </div>
    )
  }

  const status: KycStatus = kyc.status
  return (
    <div className="mb-6 rounded-2xl border border-glow/20 bg-panel/70 px-4 py-3 flex items-center justify-between gap-3">
      <p className="text-sm">
        You are on <strong>{labels[kyc.approvedTier]}</strong>
        {status === 'NOT_STARTED' ? ' — browse, add 2 draft listings, and preview AI art.' : ''}. Verify to go live, buy ads, or take payouts.
      </p>
      <Link href="/verify" className="shrink-0 bg-brand text-white text-sm font-semibold px-3 py-2 rounded-xl">
        Verify account
      </Link>
    </div>
  )
}

export function kycErrorHref(error: unknown) {
  if (
    error instanceof Error &&
    (/verif|KYC|payout|Active Vendor|Explorer accounts|business verification/i.test(error.message) ||
      ('code' in error && (error as { code?: string }).code === 'KYC_REQUIRED'))
  ) {
    return '/verify'
  }
  return null
}

export function KycActionNotice({ error }: { error: unknown }) {
  if (!error) return null
  const href = kycErrorHref(error)
  const message = error instanceof Error ? error.message : 'This action needs verification.'
  return (
    <p className="text-sm text-signal">
      {message}
      {href ? (
        <>
          {' '}
          <Link href={href} className="font-semibold underline">
            Verify account
          </Link>
        </>
      ) : null}
    </p>
  )
}
