import { ScrollView, Text, Pressable, View } from 'react-native'
import { router, usePathname } from 'expo-router'
import { layout } from '../../lib/layout'

export const courtLinks = [
  { href: '/(customer)', label: 'Home', icon: '⌂', match: 'home' },
  { href: '/(customer)/gift-cards', label: 'Gift cards', icon: '🎁', match: 'gift-cards' },
  { href: '/(customer)/specials', label: "Today's specials", icon: '⚡', match: 'specials' },
  { href: '/(customer)/bestsellers', label: 'Best sellers', icon: '★', match: 'bestsellers' },
  { href: '/(customer)/vouchers', label: 'Promotional vouchers', icon: '🎟', match: 'vouchers' },
  { href: '/(customer)/help', label: 'Customer service', icon: '☎', match: 'help' },
  { href: '/(auth)/sell', label: 'Sell', icon: '🏪', match: 'sell' },
] as const

export function CourtNav() {
  const path = usePathname() ?? ''

  return (
    <View className="mb-4 mt-3" accessibilityLabel="Mall pages">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: layout.pageX, gap: 8 }}
      >
        {courtLinks.map((item) => {
          const active =
            item.match === 'home'
              ? path === '/' || path === '/(customer)' || path.endsWith('/(customer)') || path.endsWith('/(customer)/')
              : path.includes(item.match)
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              className={`flex-row items-center rounded-full border px-3.5 ${
                active ? 'bg-brand border-brand' : 'bg-panel border-ice/10'
              }`}
              style={{ minHeight: layout.chip }}
            >
              <Text className="mr-1">{item.icon}</Text>
              <Text className={`text-sm ${active ? 'text-white' : 'text-ice'}`}>{item.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}
