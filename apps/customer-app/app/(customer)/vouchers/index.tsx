import { useState } from 'react'
import { Modal, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { formatMoney } from '../../../lib/utils/format'
import { CourtNav } from '../../../components/mall/CourtNav'
import { MallChrome } from '../../../components/mall/MallChrome'
import { MallCardFace } from '../../../components/shop/MallCardFace'
import { shopVouchers, useWalletStore } from '../../../stores/walletStore'

export default function VouchersScreen() {
  const saved = useWalletStore((state) => state.vouchers)
  const saveVoucher = useWalletStore((state) => state.saveVoucher)
  const [selected, setSelected] = useState<(typeof shopVouchers)[number] | null>(null)

  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <ScrollView contentContainerClassName="pb-12">
        <CourtNav />
        <View className="px-5">
          <Text className="text-mute text-sm">Offers</Text>
          <Text className="text-ice mt-1" style={{ fontSize: 34, fontWeight: '300' }}>
            Promotional vouchers
          </Text>
          <Text className="text-mute mt-2">Tap a card to render it. Save it, then apply the code at checkout.</Text>
        </View>
        <View className="px-5 mt-6">
          {shopVouchers.map((voucher) => (
            <Pressable key={voucher.code} className="mb-4" onPress={() => setSelected(voucher)}>
              <MallCardFace
                tone={voucher.tone}
                eyebrow="Promotional voucher"
                title={voucher.shop}
                detail={`${voucher.detail} · Min ${formatMoney(voucher.minSpend)}`}
                badge={voucher.percent ? `${voucher.percent}% OFF` : `${formatMoney(voucher.amount ?? 0)} OFF`}
                code={voucher.code}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={() => setSelected(null)}>
          {selected ? (
            <Pressable onPress={() => undefined}>
              <MallCardFace
                large
                tone={selected.tone}
                eyebrow="Promotional voucher"
                title={selected.shop}
                detail={`${selected.detail} · Min spend ${formatMoney(selected.minSpend)}`}
                badge={selected.percent ? `${selected.percent}% OFF` : `${formatMoney(selected.amount ?? 0)} OFF`}
                code={selected.code}
              />
              <View className="flex-row justify-end mt-5">
                <Pressable className="px-4 py-2" onPress={() => router.push(`/(customer)/vendor/${selected.slug}`)}>
                  <Text className="text-glow font-semibold">Visit shop</Text>
                </Pressable>
                <Pressable
                  className="rounded-full bg-brand px-5 py-2.5"
                  onPress={() => {
                    saveVoucher(selected.code)
                    setSelected(null)
                  }}
                >
                  <Text className="text-white font-semibold">
                    {saved.includes(selected.code) ? 'Saved' : 'Save this card'}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  )
}
