import { ScrollView, Text } from 'react-native'
import { shopperTerms } from '../../lib/legalCopy'

export default function LegalShopperScreen() {
  return (
    <ScrollView className="flex-1 bg-void p-6">
      <Text className="text-xs tracking-[0.2em] text-mute">LEGAL</Text>
      <Text className="text-3xl font-bold text-ice mt-2 mb-2">Shopper Terms</Text>
      <Text className="text-sm text-mute mb-6">Last updated 13 September 2026</Text>
      {shopperTerms.map((section) => (
        <Text key={section} className="text-sm text-mute leading-6 mb-4">
          {section}
        </Text>
      ))}
    </ScrollView>
  )
}
