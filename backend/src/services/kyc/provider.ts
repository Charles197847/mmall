import { randomInt } from 'node:crypto'

export type KycProviderResult = {
  provider: string
  providerRef: string
  autoApprove: boolean
}

export async function submitToKycProvider(input: {
  vendorId: string
  requestedTier: string
  legalName: string
  idNumber: string
}): Promise<KycProviderResult> {
  const autoApprove = process.env.KYC_STUB_AUTO_APPROVE === 'true'
  const provider = process.env.KYC_PROVIDER || 'smileid'
  return {
    provider,
    providerRef: `${provider}_${input.vendorId}_${randomInt(1000, 9999)}`,
    autoApprove,
  }
}
