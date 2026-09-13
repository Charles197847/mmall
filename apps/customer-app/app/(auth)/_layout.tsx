import { Stack } from 'expo-router'
import { headerOptions } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

export default function AuthLayout() {
  const mode = useThemeStore((state) => state.mode)
  return (
    <Stack screenOptions={{ ...headerOptions(mode), headerTitle: 'MMall' }}>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="legal-shopper" options={{ title: 'Shopper Terms' }} />
      <Stack.Screen name="legal-privacy" options={{ title: 'Privacy Notice' }} />
    </Stack>
  )
}
