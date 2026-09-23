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
import type { User } from '@shopping-mall/shared-types'

export default function LoginScreen() {
  const { login, persist, consumeMagic } = useAuth()
  const params = useLocalSearchParams<{ magic?: string; next?: string }>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]

  async function finish(result: { token: string; user: User }) {
    if (result.user.role === 'VENDOR') {
      Alert.alert('Merchant account', 'That email is a merchant account. Use merchant sign-in.')
      return
    }
    await persist(result.token, result.user)
    router.replace((typeof params.next === 'string' && params.next.startsWith('/') ? params.next : '/(customer)') as never)
  }

  useEffect(() => {
    const magic = typeof params.magic === 'string' ? params.magic : ''
    if (!magic) return
    void consumeMagic(magic)
      .then(() => router.replace((typeof params.next === 'string' ? params.next : '/(customer)') as never))
      .catch((error) => Alert.alert('Magic link', error instanceof Error ? error.message : 'Failed'))
  }, [params.magic])

  return (
    <Screen className="flex-1">
      <ScrollView contentContainerClassName="p-6 pt-8" keyboardShouldPersistTaps="handled">
        <BrandMark />
        <Text className="text-ice mt-8" style={{ fontSize: 32, fontWeight: '300' }}>
          Shopper sign in
        </Text>
        <Text className="text-mute mt-2 mb-8">
          Continue with Google, Apple, a passkey, or email. Password is optional.
        </Text>
        <TextInput
          className="bg-panel rounded-full px-4 py-3 mb-2 text-ice"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={colors.mute}
          autoComplete="email"
        />
        <Text className="text-xs text-mute mb-5">Needed for passkey, magic link, and email code.</Text>
        <NativeAuthMethods role="CUSTOMER" purpose="login" email={email} onSession={finish} />

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
                  await login(email, password)
                  router.replace((typeof params.next === 'string' && params.next.startsWith('/') ? params.next : '/(customer)') as never)
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

        <View className="mt-10">
          <Text className="text-mute text-center">
            New to the mall?{' '}
            <Link href="/(auth)/join">
              <Text className="text-ice font-semibold">Create an account</Text>
            </Link>
          </Text>
          <Pressable className="mt-3 items-center" onPress={() => router.push('/(auth)/vendor-login')}>
            <Text className="text-mute">I sell here</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  )
}
