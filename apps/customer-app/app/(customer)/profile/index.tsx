import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { BrandMark } from '../../../components/brand/BrandMark'
import { ThemeToggle } from '../../../components/theme/ThemeToggle'
import { useThemeStore } from '../../../stores/themeStore'
import { api } from '../../../lib/api'
import { passkeysAvailable } from '../../../lib/passkeys'
import { CourtNav } from '../../../components/mall/CourtNav'
import { mmall } from '../../../lib/theme'

export default function ProfileScreen() {
  const { user, logout, token, registerPasskey, applyUser } = useAuth()
  const mode = useThemeStore((state) => state.mode)
  const { data: notes } = useQuery({
    queryKey: ['notifications', token],
    queryFn: () => api.notifications.list(token!),
    enabled: Boolean(token),
  })

  const saved = user?.deliveryAddress
  const [street, setStreet] = useState(saved?.line1 ?? '')
  const [city, setCity] = useState(saved?.city ?? '')
  const [state, setState] = useState(saved?.state ?? '')
  const [postalCode, setPostalCode] = useState(saved?.postalCode ?? '')
  const [saving, setSaving] = useState(false)

  const saveAddress = async () => {
    if (!token) return
    if (!city.trim() || !postalCode.trim()) {
      Alert.alert('Address', 'City and postal code are required.')
      return
    }
    setSaving(true)
    try {
      const next = await api.auth.updateAddress(
        {
          fullName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
          line1: street.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: 'South Africa',
        },
        token,
      )
      await applyUser(next)
      Alert.alert('Saved', 'Delivery address updated.')
    } catch (error) {
      Alert.alert('Address', error instanceof Error ? error.message : 'Could not save address')
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView className="flex-1 p-6 bg-void" contentContainerClassName="pb-12">
      <View className="flex-row items-center justify-between">
        <BrandMark compact />
        <ThemeToggle />
      </View>
      <View className="mt-6 -mx-6">
        <CourtNav />
      </View>
      <Text className="text-2xl font-bold mb-1 text-ice">Profile</Text>
      <Text className="text-mute mb-4">{mode === 'dark' ? 'Dark grid' : 'Light grid'} appearance</Text>
      {user ? (
        <View className="bg-panel rounded-2xl p-4">
          <Text className="text-lg font-semibold text-ice">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-mute mb-4">{user.email}</Text>
          <Pressable
            className="bg-brand rounded-2xl py-3 mb-3"
            onPress={() => router.push('/(customer)/orders')}
            accessibilityRole="button"
            accessibilityLabel="View orders"
          >
            <Text className="text-white text-center font-bold">View orders</Text>
          </Pressable>
          <Pressable className="bg-navy rounded-2xl py-3 mb-3" onPress={() => router.push('/(customer)/saved')}>
            <Text className="text-glow text-center font-bold">Saved listings</Text>
          </Pressable>
          {passkeysAvailable() ? (
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
          ) : null}
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
          <Link href="/(auth)/login" className="text-glow font-semibold mb-3">
            Sign in
          </Link>
          <Link href="/(auth)/join" className="text-glow font-semibold">
            Create an account
          </Link>
        </View>
      )}

      {user ? (
        <View className="mt-6 bg-panel rounded-2xl p-4">
          <Text className="text-ice font-bold mb-3">Delivery address</Text>
          <TextInput
            className="bg-navy rounded-xl px-3 py-3 text-ice mb-2"
            placeholder="Street"
            placeholderTextColor={mmall.mute}
            value={street}
            onChangeText={setStreet}
          />
          <TextInput
            className="bg-navy rounded-xl px-3 py-3 text-ice mb-2"
            placeholder="City"
            placeholderTextColor={mmall.mute}
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            className="bg-navy rounded-xl px-3 py-3 text-ice mb-2"
            placeholder="Province"
            placeholderTextColor={mmall.mute}
            value={state}
            onChangeText={setState}
          />
          <TextInput
            className="bg-navy rounded-xl px-3 py-3 text-ice mb-3"
            placeholder="Postal code"
            placeholderTextColor={mmall.mute}
            value={postalCode}
            onChangeText={setPostalCode}
          />
          <Pressable className="bg-brand rounded-2xl py-3" onPress={() => void saveAddress()} disabled={saving}>
            <Text className="text-white text-center font-bold">{saving ? 'Saving…' : 'Save address'}</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-8">
        <Text className="text-ice font-bold mb-3">Help & legal</Text>
        <Pressable onPress={() => router.push('/(customer)/help')}>
          <Text className="text-mute mb-2">Customer service</Text>
        </Pressable>
        <Link href="/(auth)/legal-shopper" className="text-mute mb-2">
          Shopper Terms
        </Link>
        <Link href="/(auth)/legal-privacy" className="text-mute">
          Privacy Notice
        </Link>
      </View>

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
