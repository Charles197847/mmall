import { Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

const items = [
  { label: 'Shop', icon: 'shopping-bag' as const },
  { label: 'Discover', icon: 'compass' as const },
  { label: 'Safe & Secure', icon: 'shield' as const },
  { label: 'Delivered to you', icon: 'map-pin' as const },
]

export function ShopPromises() {
  const colors = palettes[useThemeStore((state) => state.mode)]
  return (
    <View className="flex-row flex-wrap gap-x-5 gap-y-2">
      {items.map((item) => (
        <View key={item.label} className="flex-row items-center">
          <Feather name={item.icon} size={16} color={colors.ice} />
          <Text className="ml-1.5 text-xs text-mute">{item.label}</Text>
        </View>
      ))}
    </View>
  )
}
