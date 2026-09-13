import '../global.css'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from '../lib/auth/AuthProvider'
import { headerOptions } from '../lib/theme'
import { useThemeStore } from '../stores/themeStore'
import { ThemeSync } from '../components/theme/ThemeSync'
import { LiveGridSync } from '../components/live/LiveGridSync'

const queryClient = new QueryClient()

export default function RootLayout() {
  const mode = useThemeStore((state) => state.mode)

  return (
    <SafeAreaProvider>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <ThemeSync />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LiveGridSync />
          <Stack screenOptions={headerOptions(mode)}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(customer)" options={{ headerShown: false }} />
            <Stack.Screen name="(vendor)" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
