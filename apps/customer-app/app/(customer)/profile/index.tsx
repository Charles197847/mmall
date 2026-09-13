import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { BrandMark } from '../../../components/brand/BrandMark'
import { ThemeToggle } from '../../../components/theme/ThemeToggle'
import { useThemeStore } from '../../../stores/themeStore'
import { api } from '../../../lib/api'

export default function ProfileScreen() {
  const { user, logout, token, registerPasskey } = useAuth()
  const mode = useThemeStore((state) => state.mode)
  const { data: notes } = useQuery({
    queryKey: ['notifications', token],
    queryFn: () => api.notifications.list(token!),
    enabled: Boolean(token),
  })

  return (
    <ScrollView className="flex-1 p-6 bg-void">
      <View className="flex-row items-center justify-between">
        <BrandMark compact />
        <ThemeToggle />
      </View>
      <Text className="text-2xl font-bold mb-1 mt-6 text-ice">Profile</Text>
      <Text className="text-mute mb-4">{mode === 'dark' ? 'Dark grid' : 'Light grid'} appearance</Text>
      {user ? (
        <View className="bg-panel rounded-2xl p-4">
          <Text className="text-lg font-semibold text-ice">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-mute mb-2">{user.email}</Text>
          <Text className="mb-6 text-mute">Role: {user.role}</Text>
          <Pressable
            className="bg-brand rounded-2xl py-3 mb-3"
            onPress={() => router.push('/(customer)/orders')}
            accessibilityRole="button"
            accessibilityLabel="View orders"
          >
            <Text className="text-white text-center font-bold">View orders</Text>
          </Pressable>
          <Pressable
            className="bg-navy rounded-2xl py-3 mb-3"
            accessibilityRole="button"
            accessibilityLabel="Add a passkey for this device"
            onPress={async () => {
              try {
                await registerPasskey()
                Alert.alert('Passkey saved', 'Next time you can sign in without a password.')
              } catch (error) {
                Alert.alert('Passkey', error instanceof Error ? error.message : 'Could not add passkey')
              }
            }}
          >
            <Text className="text-glow text-center font-bold">Add passkey to this device</Text>
          </Pressable>
          <Pressable
            className="bg-navy rounded-2xl py-3 border border-signal/40"
            onPress={async () => {
              await logout()
              router.replace('/(customer)')
            }}
          >
            <Text className="text-signal text-center font-bold">Sign out</Text>
          </Pressable>
        </View>
      ) : (
        <View className="bg-panel rounded-2xl p-4">
          <Text className="text-mute mb-4">Sign in to track orders and check out faster.</Text>
          <Link href="/(auth)/login" className="text-glow font-semibold">
            Sign in
          </Link>
        </View>
      )}

      {user && notes?.items?.length ? (
        <View className="mt-6">
          <Text className="text-ice font-bold mb-3">Notifications</Text>
          {notes.items.slice(0, 8).map((item) => (
            <View key={item.id} className="bg-panel rounded-2xl p-4 mb-2">
              <Text className="text-ice font-semibold">{item.title}</Text>
              <Text className="text-mute mt-1">{item.body}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  )
}
