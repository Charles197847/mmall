import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Link, useLocalSearchParams } from 'expo-router'
import { MallChrome } from '../../../components/mall/MallChrome'
import { CourtNav } from '../../../components/mall/CourtNav'
import { formatMoney } from '../../../lib/utils/format'
import { useWalletStore } from '../../../stores/walletStore'

export default function GiftCardClaimScreen() {
  const params = useLocalSearchParams<{ t?: string }>()
  const token = typeof params.t === 'string' ? params.t : ''
  const claimSharedCard = useWalletStore((state) => state.claimSharedCard)
  const [done, setDone] = useState<{ last4: string; remaining: number } | null>(null)
  const [error, setError] = useState('')

  function claim() {
    setError('')
    try {
      const card = claimSharedCard(token)
      setDone({ last4: card.last4, remaining: card.remaining })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not claim this card.')
    }
  }

  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <CourtNav />
      <View className="px-5">
        <Text className="text-ice" style={{ fontSize: 34, fontWeight: '300' }}>
          Claim a gift card
        </Text>
        <Text className="text-mute mt-2">
          This link holds a one-time claim token, not the card PIN. Once you claim it, the sender can no longer spend
          it and the balance works at any MMall shop.
        </Text>
        {!token ? (
          <Text className="text-mute mt-6">This link is missing its claim token.</Text>
        ) : done ? (
          <Text className="text-ice mt-6">
            Added •••• {done.last4} with {formatMoney(done.remaining)}.{' '}
            <Link href="/(customer)/gift-cards" className="text-glow">
              Open wallet
            </Link>
          </Text>
        ) : (
          <Pressable className="mt-6 rounded-full bg-brand py-3" onPress={claim}>
            <Text className="text-white text-center font-semibold">Add to my wallet</Text>
          </Pressable>
        )}
        {error ? <Text className="text-mute mt-4">{error}</Text> : null}
      </View>
    </View>
  )
}
