import { Stack } from 'expo-router'
import { headerOptions } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function OrdersLayout() {
  const mode = useThemeStore((state) => state.mode)
  return (
    <Stack screenOptions={headerOptions(mode)}>
      <Stack.Screen name="index" options={{ title: 'Orders' }} />
      <Stack.Screen name="[id]" options={{ title: 'Order details' }} />
    </Stack>
  )
}
