import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { router, usePathname } from 'expo-router'

const courtLinks = [
  { href: '/(customer)', label: 'Home', icon: '⌂', match: 'home' },
  { href: '/(customer)/gift-cards', label: 'Gift cards', icon: '🎁', match: 'gift' },
  { href: '/(customer)/specials', label: "Today's specials", icon: '⚡', match: 'specials' },
  { href: '/(customer)/bestsellers', label: 'Best sellers', icon: '★', match: 'best' },
  { href: '/(customer)/vouchers', label: 'Promotional vouchers', icon: '🎟', match: 'voucher' },
  { href: '/(customer)/help', label: 'Customer service', icon: '☎', match: 'help' },
] as const

export function CourtNav() {
  const path = usePathname()

  return (
    <View className="mb-8" accessibilityLabel="Mall pages">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-1.5">
        {courtLinks.map((item) => {
          const active =
            item.match === 'home'
              ? path === '/' || path.endsWith('/(customer)') || path === '/(customer)'
              : path.includes(item.match)
          return (
            <TouchableOpacity
              key={item.href}
              onPress={() => router.push(item.href as never)}
              className={`flex-row items-center rounded-full border px-2.5 py-1.5 ${
                active ? 'bg-brand border-glow' : 'bg-panel border-panel'
              }`}
            >
              <Text className="mr-1">{item.icon}</Text>
              <Text className={`text-xs ${active ? 'text-white' : 'text-ice'}`}>{item.label}</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
