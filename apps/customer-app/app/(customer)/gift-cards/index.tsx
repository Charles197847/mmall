import { useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native'
import * as Linking from 'expo-linking'
import { formatMoney } from '../../../lib/utils/format'
import { CourtNav } from '../../../components/mall/CourtNav'
import { MallChrome } from '../../../components/mall/MallChrome'
import { PageTitle } from '../../../components/mall/PageTitle'
import { GiftCardFace, giftTierFor } from '../../../components/shop/GiftCardFace'
import {
  clampGiftAmount,
  giftCardMax,
  giftCardMin,
  giftCardPresets,
  useWalletStore,
} from '../../../stores/walletStore'

export default function GiftCardsScreen() {
  const [amount, setAmount] = useState<(typeof giftCardPresets)[number] | 'custom'>(500)
  const [custom, setCustom] = useState('750')
  const [open, setOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [message, setMessage] = useState('')
  const cards = useWalletStore((state) => state.cards.filter((card) => card.status === 'active' && card.remaining > 0))
  const issueGiftCard = useWalletStore((state) => state.issueGiftCard)
  const createShareToken = useWalletStore((state) => state.createShareToken)
  const sessionGiftCode = useWalletStore((state) => state.sessionGiftCode)
  const balance = cards.reduce((sum, card) => sum + card.remaining, 0)
  const isCustom = amount === 'custom'
  const value = isCustom ? clampGiftAmount(Number(custom)) : amount
  const tier = giftTierFor(value, isCustom)

  async function share(cardId: string, remaining: number) {
    setMessage('')
    const token = createShareToken(cardId)
    const url = Linking.createURL('/gift-cards/claim', { queryParams: { t: token } })
    setShareUrl(url)
    try {
      await Share.share({
        title: 'MMall gift card',
        message: `Someone sent you an MMall gift card worth ${formatMoney(remaining)}. Use it at any shop.\n${url}`,
      })
    } catch {
      setMessage('Share link ready below. The PIN is not in the link.')
    }
  }

  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <ScrollView contentContainerClassName="pb-12">
        <CourtNav />
        <PageTitle
          kicker="Credit"
          title="Gift cards"
          lede="Illustrated mall credit. Share a claim link — the PIN stays on this phone."
        />

        <Pressable className="mx-5 mt-6" onPress={() => setOpen(true)}>
          <GiftCardFace amount={value} custom={isCustom} />
        </Pressable>

        <View className="flex-row flex-wrap px-5 mt-6">
          {giftCardPresets.map((preset) => (
            <Pressable
              key={preset}
              onPress={() => setAmount(preset)}
              className={`rounded-full px-4 mr-2 mb-2 items-center justify-center ${amount === preset ? 'bg-brand' : 'bg-panel'}`}
              style={{ minHeight: 40 }}
            >
              <Text className={amount === preset ? 'text-white font-semibold' : 'text-ice'}>
                {formatMoney(preset)}
              </Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setAmount('custom')}
            className={`rounded-full px-4 py-2 mb-2 ${isCustom ? 'bg-brand' : 'bg-panel'}`}
          >
            <Text className={isCustom ? 'text-white font-semibold' : 'text-ice'}>Custom</Text>
          </Pressable>
        </View>
        {isCustom ? (
          <TextInput
            className="mx-5 rounded-2xl bg-panel px-4 py-3 text-ice"
            keyboardType="numeric"
            value={custom}
            onChangeText={setCustom}
            placeholder={`R${giftCardMin}–R${giftCardMax}`}
          />
        ) : null}

        <Pressable
          className="mx-5 mt-4 rounded-full bg-brand py-3"
          onPress={() => {
            const card = issueGiftCard(value)
            Alert.alert(`${tier.name} issued`, `Code ${card.code}\nKeep this PIN. Share uses a claim link, not the PIN.`)
            setOpen(true)
          }}
        >
          <Text className="text-white text-center font-semibold">Purchase {tier.name}</Text>
        </Pressable>

        <View className="px-5 mt-10">
          <Text className="text-ice" style={{ fontSize: 22, fontWeight: '300' }}>
            Wallet {balance ? `· ${formatMoney(balance)}` : ''}
          </Text>
          {cards.length === 0 ? (
            <Text className="text-mute mt-3">No active cards yet.</Text>
          ) : (
            cards.map((card) => {
              const code = sessionGiftCode(card.id)
              return (
                <Pressable
                  key={card.id}
                  className="mt-4"
                  onPress={() => void share(card.id, card.remaining)}
                >
                  <GiftCardFace
                    amount={card.remaining}
                    custom={!giftCardPresets.includes(card.amount as (typeof giftCardPresets)[number])}
                    last4={card.last4}
                  />
                  <Text className="text-mute text-xs mt-2">
                    {code ? `PIN ${code} · ` : ''}•••• {card.last4} · tap to share claim link
                  </Text>
                </Pressable>
              )
            })
          )}
          {shareUrl ? <Text className="text-mute text-xs mt-3">{shareUrl}</Text> : null}
          {message ? <Text className="text-mute text-xs mt-2">{message}</Text> : null}
        </View>
      </ScrollView>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center px-6" onPress={() => setOpen(false)}>
          <Pressable onPress={() => undefined}>
            <GiftCardFace amount={value} custom={isCustom} large />
            <Pressable className="mt-5 rounded-full bg-brand py-3" onPress={() => setOpen(false)}>
              <Text className="text-white text-center font-semibold">Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}
