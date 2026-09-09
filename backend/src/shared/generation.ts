import { FREE_GENERATIONS_PER_ASSET, type GenerationAssetType, type PlatformSettings } from '@shopping-mall/shared-types'

export { FREE_GENERATIONS_PER_ASSET }

export type QuotaUsage = {
  freeUsed: number
  paidCredits: number
}

export function unitPriceForAsset(assetType: GenerationAssetType, settings: PlatformSettings) {
  return assetType === 'LOGO' ? settings.logoGenerationPrice : settings.bannerGenerationPrice
}

export function quotaSnapshot(assetType: GenerationAssetType, usage: QuotaUsage, settings: PlatformSettings) {
  const freeRemaining = Math.max(0, FREE_GENERATIONS_PER_ASSET - usage.freeUsed)
  return {
    assetType,
    freeLimit: FREE_GENERATIONS_PER_ASSET,
    freeUsed: usage.freeUsed,
    freeRemaining,
    paidCredits: usage.paidCredits,
    unitPrice: unitPriceForAsset(assetType, settings),
    canGenerate: freeRemaining > 0 || usage.paidCredits > 0,
  }
}

export function consumeGenerationQuota(usage: QuotaUsage) {
  if (usage.freeUsed < FREE_GENERATIONS_PER_ASSET) {
    return {
      billedAs: 'FREE' as const,
      next: { freeUsed: usage.freeUsed + 1, paidCredits: usage.paidCredits },
    }
  }
  if (usage.paidCredits > 0) {
    return {
      billedAs: 'PAID' as const,
      next: { freeUsed: usage.freeUsed, paidCredits: usage.paidCredits - 1 },
    }
  }
  return {
    billedAs: 'BLOCKED' as const,
    next: usage,
  }
}
