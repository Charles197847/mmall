import type { AdSlot, PlatformSettings } from '@shopping-mall/shared-types'
import { roundMoney } from './fees.js'

export function campaignWeeks(startsAt: Date, endsAt: Date) {
  const ms = Math.max(0, endsAt.getTime() - startsAt.getTime())
  return Math.max(1, Math.ceil(ms / (7 * 24 * 60 * 60 * 1000)))
}

export function pushBlastPrice(settings: PlatformSettings, audienceSize = settings.pushBlastAudience) {
  const cap = settings.pushBlastAudience || 200000
  const t = Math.min(1, Math.max(0, audienceSize / cap))
  return roundMoney(settings.pushBlastMinPrice + (settings.pushBlastMaxPrice - settings.pushBlastMinPrice) * t)
}

export function priceForSlot(
  slot: AdSlot,
  settings: PlatformSettings,
  options: { startsAt: Date; endsAt: Date; audienceSize?: number },
) {
  if (slot === 'PUSH_BLAST') {
    return pushBlastPrice(settings, options.audienceSize ?? settings.pushBlastAudience)
  }
  const weeks = campaignWeeks(options.startsAt, options.endsAt)
  const weekly =
    slot === 'HOMEPAGE_BANNER'
      ? settings.homepageBannerWeeklyPrice
      : slot === 'SEARCH_FEATURE'
        ? settings.searchFeatureWeeklyPrice
        : settings.shopHighlightWeeklyPrice
  return roundMoney(weekly * weeks)
}

export function campaignStatusForDates(startsAt: Date, endsAt: Date, now = new Date()) {
  if (endsAt <= now) return 'ENDED' as const
  if (startsAt <= now) return 'ACTIVE' as const
  return 'SCHEDULED' as const
}
