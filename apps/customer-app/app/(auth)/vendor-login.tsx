import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Link, router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { Screen } from '../../components/ui/Screen'
import { BrandMark } from '../../components/brand/BrandMark'
import { NativeAuthMethods } from '../../components/auth/NativeAuthMethods'
import { AuthRule } from '../../components/auth/AuthRule'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import { api } from '../../lib/api'
import type { User } from '@shopping-mall/shared-types'

export default function VendorLoginScreen() {
  const { persist, consumeMagic } = useAuth()
  const params = useLocalSearchParams<{ magic?: string }>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const colors = palettes[useThemeStore((state) => state.mode)]

  async function finish(result: { token: string; user: User }) {
    if (result.user.role !== 'VENDOR') {
      Alert.alert('Shopper account', 'Use shopper sign-in to buy.')
      return
    }
    await persist(result.token, result.user)
    router.replace('/(vendor)/dashboard')
  }

  useEffect(() => {
    const magic = typeof params.magic === 'string' ? params.magic : ''
    if (!magic) return
    void consumeMagic(magic)
      .then(() => router.replace('/(vendor)/dashboard'))
      .catch((error) => Alert.alert('Magic link', error instanceof Error ? error.message : 'Failed'))
  }, [params.magic])

  return (
    <Screen className="flex-1">
      <ScrollView contentContainerClassName="p-6 pt-8" keyboardShouldPersistTaps="handled">
        <BrandMark />
        <Text className="text-xs text-mute mt-8">Merchant</Text>
        <Text className="text-ice mt-2" style={{ fontSize: 32, fontWeight: '300' }}>
          Merchant sign in
        </Text>
        <Text className="text-mute mt-2 mb-8">Continue with Google, Apple, a passkey, or email.</Text>
        <TextInput
          className="bg-panel rounded-full px-4 py-3 mb-2 text-ice"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="Work email"
          placeholderTextColor={colors.mute}
        />
        <Text className="text-xs text-mute mb-5">Needed for passkey, magic link, and email code.</Text>
        <NativeAuthMethods role="VENDOR" purpose="login" email={email} onSession={finish} />

        <AuthRule label="or password" />
        <Pressable onPress={() => setShowPassword((value) => !value)}>
          <Text className="text-mute">{showPassword ? 'Hide password' : 'Use a password instead'}</Text>
        </Pressable>
        {showPassword ? (
          <View className="mt-3">
            <TextInput
              className="bg-panel rounded-full px-4 py-3 mb-3 text-ice"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.mute}
            />
            <Pressable
              className="bg-brand rounded-full py-3"
              disabled={loading}
              onPress={async () => {
                setLoading(true)
                try {
                  const result = await api.auth.login(email, password)
                  if (!result.token) throw new Error(result.error || 'Login failed')
                  await finish(result)
                } catch (error) {
                  Alert.alert('Login failed', error instanceof Error ? error.message : 'Try again')
                } finally {
                  setLoading(false)
                }
              }}
            >
              <Text className="text-white text-center font-semibold">
                {loading ? 'Signing in...' : 'Sign in with password'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Text className="text-mute text-center mt-10">
          New store?{' '}
          <Link href="/(auth)/sell">
            <Text className="text-ice font-semibold">Create a store</Text>
          </Link>
          {' · '}
          <Link href="/(auth)/login">
            <Text className="text-ice font-semibold">I want to shop</Text>
          </Link>
        </Text>
      </ScrollView>
    </Screen>
  )
}
