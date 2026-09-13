import { HttpError } from './middleware/error.js'
import { prisma } from './database/index.js'
import type { KycStatus, KycTier } from '@prisma/client'

export const KYC_TIER_RANK: Record<KycTier, number> = {
  EXPLORER: 0,
  ACTIVE_VENDOR: 1,
  ENTERPRISE: 2,
}

export const EXPLORER_PRODUCT_LIMIT = 2

export type KycSnapshot = {
  approvedTier: KycTier
  requestedTier: KycTier
  status: KycStatus
  identityType: string | null
  legalName: string | null
  idNumber: string | null
  residentialAddress: string | null
  idDocumentName: string | null
  addressDocumentName: string | null
  selfieCaptured: boolean
  cipcDocumentName: string | null
  taxNumber: string | null
  vatNumber: string | null
  bankProofName: string | null
  rejectionReason: string | null
  reviewEtaMinutes: number
  provider: string
  submittedAt: string | null
  reviewedAt: string | null
}

export function serializeKyc(row: {
  approvedTier: KycTier
  requestedTier: KycTier
  status: KycStatus
  identityType: string | null
  legalName: string | null
  idNumber: string | null
  residentialAddress: string | null
  idDocumentName: string | null
  addressDocumentName: string | null
  selfieCaptured: boolean
  cipcDocumentName: string | null
  taxNumber: string | null
  vatNumber: string | null
  bankProofName: string | null
  rejectionReason: string | null
  reviewEtaMinutes: number
  provider: string
  submittedAt: Date | null
  reviewedAt: Date | null
}): KycSnapshot {
  return {
    approvedTier: row.approvedTier,
    requestedTier: row.requestedTier,
    status: row.status,
    identityType: row.identityType,
    legalName: row.legalName,
    idNumber: row.idNumber,
    residentialAddress: row.residentialAddress,
    idDocumentName: row.idDocumentName,
    addressDocumentName: row.addressDocumentName,
    selfieCaptured: row.selfieCaptured,
    cipcDocumentName: row.cipcDocumentName,
    taxNumber: row.taxNumber,
    vatNumber: row.vatNumber,
    bankProofName: row.bankProofName,
    rejectionReason: row.rejectionReason,
    reviewEtaMinutes: row.reviewEtaMinutes,
    provider: row.provider,
    submittedAt: row.submittedAt?.toISOString() ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
  }
}

export async function ensureVendorKyc(vendorId: string) {
  return prisma.vendorKyc.upsert({
    where: { vendorId },
    update: {},
    create: { vendorId },
  })
}

export async function assertKyc(vendorId: string, required: KycTier) {
  const kyc = await ensureVendorKyc(vendorId)
  if (KYC_TIER_RANK[kyc.approvedTier] >= KYC_TIER_RANK[required]) {
    return kyc
  }
  throw new HttpError(403, kycMessage(required, kyc.status), {
    code: 'KYC_REQUIRED',
    requiredTier: required,
    currentTier: kyc.approvedTier,
    status: kyc.status,
  })
}

function kycMessage(required: KycTier, status: KycStatus) {
  if (status === 'PENDING') {
    return 'Verification is still in review. This usually completes within 15–30 minutes.'
  }
  if (required === 'ENTERPRISE') {
    return 'Payouts and R5,000+ ad blasts need business verification (CIPC, tax, and bank proof).'
  }
  return 'Publishing, paid ads, and paid AI credits need Active Vendor verification.'
}
