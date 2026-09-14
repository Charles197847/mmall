import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'

const columns = [
  {
    title: 'The mall',
    links: [
      { href: '/(customer)', label: 'Home' },
      { href: '/(customer)/specials', label: "Today's specials" },
      { href: '/(customer)/bestsellers', label: 'Best sellers' },
      { href: '/(customer)/gift-cards', label: 'Gift cards' },
      { href: '/(customer)/vouchers', label: 'Promotional vouchers' },
    ],
  },
  {
    title: 'Sell on MMall',
    links: [
      { href: '/(auth)/sell', label: 'Open a store' },
      { href: '/(auth)/vendor-login', label: 'Vendor sign in' },
      { href: '/(vendor)/dashboard', label: 'Advertise & fees' },
    ],
  },
  {
    title: 'Orders & help',
    links: [
      { href: '/(customer)/profile', label: 'Your account' },
      { href: '/(customer)/orders', label: 'Track an order' },
      { href: '/(customer)/gift-cards', label: 'Gift card balance' },
      { href: '/(customer)/help', label: 'Returns' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { href: '/(customer)/help', label: 'PayGate checkout' },
      { href: '/(auth)/legal-shopper', label: 'Shopper Terms' },
      { href: '/(auth)/legal-vendor', label: 'Vendor Terms' },
      { href: '/(auth)/legal-privacy', label: 'Privacy Notice' },
      { href: '/(auth)/legal-fees', label: 'Fees' },
    ],
  },
] as const

export function MallFooter() {
  return (
    <View className="mt-8 px-5 pb-10">
      <Pressable onPress={() => router.push('/(customer)')} className="py-3 items-center">
        <Text className="text-sm text-mute">Back to top</Text>
      </Pressable>
      {columns.map((column) => (
        <View key={column.title} className="mt-6">
          <Text className="text-sm font-semibold text-ice">{column.title}</Text>
          {column.links.map((link) => (
            <Pressable key={link.label} className="mt-2.5" onPress={() => router.push(link.href as never)}>
              <Text className="text-sm text-mute">{link.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View className="items-center mt-10">
        <Text className="text-lg font-bold text-ice tracking-tight">M-MALL</Text>
        <Text className="text-xs text-mute mt-1">The digital shopping mall · South Africa · 2027–2035</Text>
      </View>
    </View>
  )
}
