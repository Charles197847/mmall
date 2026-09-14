import { Text, View } from 'react-native'
import { formatMoney } from '../../lib/utils/format'
import { giftCardPresets } from '../../stores/walletStore'

export type GiftScene = 'sky' | 'trees' | 'frost' | 'sunburst' | 'aurora' | 'facets' | 'night' | 'sunset'

export type GiftTier = {
  name: string
  scene: GiftScene
  wash: string
}

export const giftTiers: Record<(typeof giftCardPresets)[number] | 'custom', GiftTier> = {
  100: { name: 'Blue voucher', scene: 'sky', wash: '#1d4ed8' },
  200: { name: 'Green voucher', scene: 'trees', wash: '#166534' },
  300: { name: 'Silver voucher', scene: 'frost', wash: '#64748b' },
  500: { name: 'Gold voucher', scene: 'sunburst', wash: '#b45309' },
  1000: { name: 'Platinum voucher', scene: 'aurora', wash: '#94a3b8' },
  2000: { name: 'Diamond voucher', scene: 'facets', wash: '#0369a1' },
  5000: { name: 'Black voucher', scene: 'night', wash: '#171717' },
  custom: { name: 'Horizon voucher', scene: 'sunset', wash: '#7c3aed' },
}

export function giftTierFor(amount: number, custom = false): GiftTier {
  if (custom) return giftTiers.custom
  return giftTiers[amount as (typeof giftCardPresets)[number]] ?? giftTiers.custom
}

function Scene({ scene }: { scene: GiftScene }) {
  if (scene === 'sky') {
    return (
      <>
        <View className="absolute left-6 top-6 h-10 w-10 rounded-full bg-yellow-200/80" />
        <View className="absolute left-10 top-14 h-6 w-24 rounded-full bg-white/80" />
        <View className="absolute right-8 top-10 h-7 w-28 rounded-full bg-white/70" />
      </>
    )
  }
  if (scene === 'trees') {
    return (
      <>
        <View className="absolute bottom-0 left-0 right-0 h-10 bg-green-900/70" />
        <View className="absolute bottom-8 left-10 h-16 w-8 rounded-t-full bg-green-800" />
        <View className="absolute bottom-8 right-16 h-24 w-10 rounded-t-full bg-green-700" />
      </>
    )
  }
  if (scene === 'night') {
    return (
      <>
        <View className="absolute right-8 top-6 h-2 w-2 rounded-full bg-white/70" />
        <View className="absolute right-16 top-12 h-1.5 w-1.5 rounded-full bg-white/50" />
        <View className="absolute left-10 top-8 h-1 w-1 rounded-full bg-white/60" />
      </>
    )
  }
  return (
    <>
      <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <View className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-black/20" />
    </>
  )
}

export function GiftCardFace({
  amount,
  custom = false,
  large = false,
  last4,
}: {
  amount: number
  custom?: boolean
  large?: boolean
  last4?: string
}) {
  const tier = giftTierFor(amount, custom)
  return (
    <View
      className={`relative overflow-hidden rounded-[28px] ${large ? 'p-8' : 'p-6'}`}
      style={{ backgroundColor: tier.wash, minHeight: large ? 220 : 160 }}
    >
      <Scene scene={tier.scene} />
      <Text className="text-white/70 text-xs">{tier.name}</Text>
      <Text className="text-white mt-3" style={{ fontSize: large ? 44 : 36, fontWeight: '300' }}>
        {formatMoney(amount)}
      </Text>
      <Text className="text-white/80 mt-2">Spend at any shop on the mall.</Text>
      {last4 ? <Text className="text-white/70 font-mono mt-4">•••• {last4}</Text> : null}
    </View>
  )
}
