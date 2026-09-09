import { Stack } from 'expo-router'
import { headerOptions } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function CartLayout() {
  const mode = useThemeStore((state) => state.mode)
  return (
    <Stack screenOptions={headerOptions(mode)}>
      <Stack.Screen name="index" options={{ title: 'Cart' }} />
      <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
    </Stack>
  )
}
