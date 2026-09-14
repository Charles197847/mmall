import { Stack } from 'expo-router'
import { headerOptions } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

export default function VendorGroupLayout() {
  const mode = useThemeStore((state) => state.mode)
  return (
    <Stack screenOptions={{ ...headerOptions(mode), headerShown: false }}>
      <Stack.Screen name="dashboard/index" />
      <Stack.Screen name="dashboard/products" />
      <Stack.Screen name="dashboard/orders" />
      <Stack.Screen name="dashboard/advertise" />
      <Stack.Screen name="dashboard/studio" />
      <Stack.Screen name="dashboard/settings" />
      <Stack.Screen name="dashboard/fees" />
      <Stack.Screen name="dashboard/verify" />
      <Stack.Screen name="store/[slug]" />
    </Stack>
  )
}
