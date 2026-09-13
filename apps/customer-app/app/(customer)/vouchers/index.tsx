import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { formatMoney } from '../../../lib/utils/format'

const tones: Record<string, string> = {
  rose: 'bg-[#e11d48]',
  teal: 'bg-[#0f766e]',
  amber: 'bg-[#d97706]',
  violet: 'bg-[#7c3aed]',
  navy: 'bg-[#1e40af]',
}

const shopVouchers = [
  { code: 'VELVET10', shop: 'Velvet Lane', detail: 'Apparel court this week', percent: 10, minSpend: 250, tone: 'rose' },
  { code: 'NORTH50', shop: 'Northline Supply', detail: 'Outdoor and tools', amount: 50, minSpend: 400, tone: 'teal' },
  { code: 'HARBOR15', shop: 'Harbor Home', detail: 'Home court weekend', percent: 15, minSpend: 500, tone: 'amber' },
  { code: 'LUMEN30', shop: 'Lumen Beauty', detail: 'Skincare and salon', amount: 30, minSpend: 150, tone: 'violet' },
  { code: 'ATLAS12', shop: 'Atlas Sport', detail: 'Training kit', percent: 12, minSpend: 300, tone: 'navy' },
]

export default function VouchersScreen() {
  return (
    <ScrollView className="flex-1 bg-void" contentContainerClassName="pb-10">
      <View className="pt-14 px-4">
        <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Offers</Text>
        <Text className="text-3xl font-semibold text-ice mt-1">Vouchers</Text>
      </View>
      <Text className="px-4 mt-2 text-mute">Tap a card to save the code, then apply it at checkout.</Text>
      <View className="px-4 mt-6">
        {shopVouchers.map((voucher) => (
          <Pressable
            key={voucher.code}
            className={`rounded-2xl p-5 mb-4 overflow-hidden ${tones[voucher.tone]}`}
            onPress={() => Alert.alert('Voucher saved', `${voucher.code} is ready at checkout.`)}
          >
            <Text className="text-white/70 text-xs tracking-[0.2em] uppercase">Promotional voucher</Text>
            <Text className="text-white text-2xl font-semibold mt-2">{voucher.shop}</Text>
            <Text className="text-white/80 mt-1">
              {voucher.detail} · Min {formatMoney(voucher.minSpend)}
            </Text>
            <View className="my-4 border-t border-dashed border-white/40" />
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-mono text-lg tracking-wider">{voucher.code}</Text>
              <Text className="text-white font-bold">
                {voucher.percent ? `${voucher.percent}% OFF` : `${formatMoney(voucher.amount ?? 0)} OFF`}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}
