import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { Screen } from '../../components/ui/Screen'
import { BrandMark } from '../../components/brand/BrandMark'
import { NativeAuthMethods } from '../../components/auth/NativeAuthMethods'
import { AuthRule } from '../../components/auth/AuthRule'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import type { User } from '@shopping-mall/shared-types'

export default function RegisterScreen() {
  const { register, persist } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const colors = palettes[useThemeStore((state) => state.mode)]

  async function finish(result: { token: string; user: User }) {
    if (!accepted) {
      Alert.alert('Terms', 'Accept the Shopper Terms to create an account.')
      return
    }
    if (result.user.role !== 'CUSTOMER') {
      Alert.alert('Merchant account', 'Use merchant sign-up to open a store.')
      return
    }
    await persist(result.token, result.user)
    router.replace('/(customer)')
  }

  return (
    <Screen className="flex-1">
      <ScrollView contentContainerClassName="p-6 pt-8" keyboardShouldPersistTaps="handled">
        <BrandMark />
        <Text className="text-ice mt-8" style={{ fontSize: 32, fontWeight: '300' }}>
          Create your account
        </Text>
        <Text className="text-mute mt-2 mb-6">One bag across every shop in the mall.</Text>

        <Pressable className="flex-row items-start mb-5" onPress={() => setAccepted((value) => !value)}>
          <View className={`w-6 h-6 rounded border mr-3 mt-0.5 items-center justify-center ${accepted ? 'bg-brand border-brand' : 'border-mute'}`} />
          <Text className="text-mute flex-1 leading-5">
            I agree to the{' '}
            <Link href="/(auth)/legal-shopper">
              <Text className="text-ice font-semibold">Shopper Terms</Text>
            </Link>
            {' and the '}
            <Link href="/(auth)/legal-privacy">
              <Text className="text-ice font-semibold">Privacy Notice</Text>
            </Link>
            .
          </Text>
        </Pressable>
        {!accepted ? (
          <Text className="text-xs text-mute mb-5">Accept the terms to continue with Google, Apple, or email.</Text>
        ) : null}

        <NativeAuthMethods
          role="CUSTOMER"
          purpose="signup"
          email={email}
          firstName={firstName}
          lastName={lastName}
          locked={!accepted}
          kinds={['google', 'apple']}
          onSession={finish}
        />

        <AuthRule label="or use email" />

        <View className="flex-row gap-3">
          <TextInput
            className="flex-1 bg-panel rounded-full px-4 py-3 text-ice"
            placeholder="First name"
            placeholderTextColor={colors.mute}
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            className="flex-1 bg-panel rounded-full px-4 py-3 text-ice"
            placeholder="Last name"
            placeholderTextColor={colors.mute}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        <TextInput
          className="bg-panel rounded-full px-4 py-3 mt-3 text-ice"
          placeholder="Email"
          placeholderTextColor={colors.mute}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text className="text-xs text-mute mt-2 mb-5">Needed for a passkey, magic link, or one-time code.</Text>

        <NativeAuthMethods
          role="CUSTOMER"
          purpose="signup"
          email={email}
          firstName={firstName}
          lastName={lastName}
          locked={!accepted}
          kinds={['passkey', 'magic', 'otp']}
          onSession={finish}
        />

        <Pressable className="mt-6" onPress={() => setShowPassword(true)}>
          <Text className="text-mute">Prefer a password?</Text>
        </Pressable>
        {showPassword ? (
          <View className="mt-3">
            <TextInput
              className="bg-panel rounded-full px-4 py-3 mb-3 text-ice"
              placeholder="Password (8+ characters)"
              placeholderTextColor={colors.mute}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              className="bg-brand rounded-full py-3"
              disabled={loading || !accepted}
              onPress={async () => {
                if (!accepted) {
                  Alert.alert('Terms', 'Accept the Shopper Terms to create an account.')
                  return
                }
                setLoading(true)
                try {
                  await register({ email, password, firstName, lastName })
                  router.replace('/(customer)')
                } catch (error) {
                  Alert.alert('Sign-up failed', error instanceof Error ? error.message : 'Try again')
                } finally {
                  setLoading(false)
                }
              }}
            >
              <Text className="text-white text-center font-semibold">{loading ? 'Creating...' : 'Create account'}</Text>
            </Pressable>
          </View>
        ) : null}

        <Text className="text-mute text-center mt-10">
          Already shop here?{' '}
          <Link href="/(auth)/login">
            <Text className="text-ice font-semibold">Sign in</Text>
          </Link>
        </Text>
      </ScrollView>
    </Screen>
  )
}
