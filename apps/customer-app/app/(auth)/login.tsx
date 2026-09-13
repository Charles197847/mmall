import { useEffect, useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Link, router, useLocalSearchParams } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { Screen } from '../../components/ui/Screen'
import { BrandMark } from '../../components/brand/BrandMark'
import { NativeAuthMethods } from '../../components/auth/NativeAuthMethods'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import type { User } from '@shopping-mall/shared-types'

export default function LoginScreen() {
  const { login, persist, consumeMagic } = useAuth()
  const params = useLocalSearchParams<{ magic?: string }>()
  const [email, setEmail] = useState('customer@shopping-mall.local')
  const [password, setPassword] = useState('Password123!')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]

  async function finish(result: { token: string; user: User }) {
    if (result.user.role === 'VENDOR') {
      Alert.alert('Merchant account', 'Use the vendor desk on the web to sell.')
      return
    }
    await persist(result.token, result.user)
    router.replace('/(customer)')
  }

  useEffect(() => {
    const magic = typeof params.magic === 'string' ? params.magic : ''
    if (!magic) return
    void consumeMagic(magic)
      .then(() => router.replace('/(customer)'))
      .catch((error) => Alert.alert('Magic link', error instanceof Error ? error.message : 'Failed'))
  }, [params.magic])

  return (
    <Screen className="flex-1">
      <ScrollView contentContainerClassName="p-6 pt-8" keyboardShouldPersistTaps="handled">
      <BrandMark />
      <Text className="text-ice text-3xl font-bold mt-8 mb-2">Shopper sign in</Text>
      <Text className="text-mute mb-8">Continue with Apple, Google, a passkey, or email.</Text>
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
      <NativeAuthMethods purpose="login" email={email} onSession={finish} />

      <Pressable className="mt-6" onPress={() => setShowPassword((value) => !value)}>
        <Text className="text-mute">{showPassword ? 'Hide password' : 'Prefer a password?'}</Text>
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
                router.replace('/(customer)')
              } catch (error) {
                Alert.alert('Login failed', error instanceof Error ? error.message : 'Try again')
              } finally {
                setLoading(false)
              }
            }}
          >
            <Text className="text-white text-center font-bold">{loading ? 'Signing in...' : 'Sign in with password'}</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="mt-8 flex-row justify-center">
        <Text className="text-mute">New to the mall? </Text>
        <Link href="/(auth)/register">
          <Text className="text-glow font-semibold">Create an account</Text>
        </Link>
      </View>
      </ScrollView>
    </Screen>
  )
}
