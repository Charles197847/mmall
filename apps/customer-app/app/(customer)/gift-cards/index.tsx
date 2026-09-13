import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { formatMoney } from '../../../lib/utils/format'

const presets = [100, 200, 300, 500, 1000, 2000, 5000]

export default function GiftCardsScreen() {
  const [amount, setAmount] = useState(500)

  return (
    <ScrollView className="flex-1 bg-void" contentContainerClassName="pb-10">
      <View className="pt-14 px-4">
        <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Credit</Text>
        <Text className="text-3xl font-semibold text-ice mt-1">Gift cards</Text>
      </View>
      <Text className="px-4 mt-2 text-mute">Send mall credit. Preview builds keep the card on this phone.</Text>

      <View className="mx-4 mt-6 rounded-2xl bg-[#1e40af] p-6 overflow-hidden">
        <Text className="text-white/70 text-xs tracking-[0.2em] uppercase">MMall gift card</Text>
        <Text className="text-white text-4xl font-semibold mt-3">{formatMoney(amount)}</Text>
        <Text className="text-white/80 mt-2">Redeemable at any shop on the grid.</Text>
      </View>

      <View className="flex-row flex-wrap px-4 mt-6 gap-2">
        {presets.map((value) => (
          <Pressable
            key={value}
            onPress={() => setAmount(value)}
            className={`rounded-full px-4 py-2 ${amount === value ? 'bg-brand' : 'bg-panel'}`}
          >
            <Text className={amount === value ? 'text-white font-semibold' : 'text-ice'}>{formatMoney(value)}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        className="mx-4 mt-6 rounded-full bg-brand py-3"
        onPress={() => Alert.alert('Gift card', `${formatMoney(amount)} mall credit is ready on this device.`)}
      >
        <Text className="text-white text-center font-semibold">Buy gift card</Text>
      </Pressable>
    </ScrollView>
  )
}
