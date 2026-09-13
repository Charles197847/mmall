import { Pressable, ScrollView, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '../../../lib/auth/AuthProvider'

const sections = [
  {
    title: 'Orders',
    body: 'Open Orders to track a bag from PayGate through Courier Guy. Guest checkout is not available — sign in first.',
  },
  {
    title: 'Returns',
    body: 'Most court items can be returned within 7 days if unused and in original packing. Food court and salon slots are final sale.',
  },
  {
    title: 'Delivery',
    body: 'Set Deliver to on Home so quotes use your city. Courier Guy Eco, Overnight, and Same-day appear at checkout when the route is open.',
  },
  {
    title: 'Payments',
    body: 'Preview builds use mock PayWeb. No live card is charged. Instant EFT and Visa still show the same return screen.',
  },
]

export default function HelpScreen() {
  const { user } = useAuth()

  return (
    <ScrollView className="flex-1 bg-void pt-14" contentContainerClassName="pb-12 px-5">
      <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Desk</Text>
      <Text className="text-3xl font-semibold text-ice mt-1">Customer service</Text>
      <Text className="text-mute mt-2">Orders, returns, and the shopper desk for MMall.</Text>

      {user ? (
        <Pressable className="mt-5 bg-brand rounded-2xl py-3" onPress={() => router.push('/(customer)/orders')}>
          <Text className="text-white text-center font-bold">View my orders</Text>
        </Pressable>
      ) : (
        <Link href="/(auth)/login" className="mt-5 text-glow font-semibold">
          Sign in to see orders
        </Link>
      )}

      {sections.map((section) => (
        <View key={section.title} className="mt-6 bg-panel rounded-2xl p-4">
          <Text className="text-ice font-bold">{section.title}</Text>
          <Text className="text-mute mt-2 leading-6">{section.body}</Text>
        </View>
      ))}

      <View className="mt-6">
        <Link href="/(auth)/legal-shopper" className="text-mute mb-2">
          Shopper Terms
        </Link>
        <Link href="/(auth)/legal-privacy" className="text-mute">
          Privacy Notice
        </Link>
      </View>
    </ScrollView>
  )
}
