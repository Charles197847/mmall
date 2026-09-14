import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Link, router } from 'expo-router'
import { Screen } from '../../components/ui/Screen'
import { BrandMark } from '../../components/brand/BrandMark'
import { NativeAuthMethods } from '../../components/auth/NativeAuthMethods'
import { AuthRule } from '../../components/auth/AuthRule'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth/AuthProvider'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import type { User } from '@shopping-mall/shared-types'

const reasons = [
  { title: 'Your own shop', detail: 'A branded store on the mall, not a listing lost in a marketplace dump.' },
  { title: 'One checkout', detail: 'Shoppers pay once with PayGate. You fulfil from your court.' },
  { title: 'Ads and studio', detail: 'Promote on the mall and generate banners when you are ready.' },
  { title: 'Gift cards', detail: 'MMall cards spend at every shop, including yours.' },
]

export default function SellScreen() {
  const { persist } = useAuth()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [otpId, setOtpId] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [firstName, ...lastParts] = fullName.trim().split(/\s+/)
  const lastName = lastParts.join(' ')

  async function finish(result: { token: string; user: User }) {
    await persist(result.token, result.user)
    router.replace('/(vendor)/dashboard')
  }

  async function sendOtp() {
    setBusy(true)
    try {
      const result = await api.auth.sendOtp({ phone })
      setOtpId(result.otpId)
      setDemoCode(result.demoCode ?? '')
    } catch (error) {
      Alert.alert('Could not send code', error instanceof Error ? error.message : 'Try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen className="flex-1">
      <ScrollView contentContainerClassName="p-6 pt-8 pb-16" keyboardShouldPersistTaps="handled">
        <BrandMark />
        <Text className="text-xs text-mute mt-8">Vendor</Text>
        <Text className="text-ice mt-2" style={{ fontSize: 32, fontWeight: '300' }}>
          Sell on MMall
        </Text>
        <Text className="text-mute mt-2">
          This creates a merchant account and a store. Shopping uses a different shopper sign-up.
        </Text>
        <Link href="/(auth)/register" className="mt-2">
          <Text className="text-ice font-semibold">I only want to buy</Text>
        </Link>

        <View className="mt-8 gap-3">
          {reasons.map((item) => (
            <View key={item.title} className="rounded-2xl bg-panel p-4">
              <Text className="text-ice font-semibold">{item.title}</Text>
              <Text className="text-mute text-sm mt-1">{item.detail}</Text>
            </View>
          ))}
        </View>

        <Text className="text-ice text-xl mt-10" style={{ fontWeight: '300' }}>
          Create your shop
        </Text>
        <TextInput
          className="bg-panel rounded-2xl px-4 py-3 mt-4 text-ice"
          placeholder="Full name"
          placeholderTextColor={colors.mute}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          className="bg-panel rounded-2xl px-4 py-3 mt-3 text-ice"
          placeholder="Work email"
          placeholderTextColor={colors.mute}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View className="flex-row gap-2 mt-3">
          <TextInput
            className="flex-1 bg-panel rounded-2xl px-4 py-3 text-ice"
            placeholder="Phone +27…"
            placeholderTextColor={colors.mute}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Pressable
            className="bg-navy rounded-2xl px-4 justify-center"
            disabled={busy || phone.length < 10}
            onPress={() => void sendOtp()}
          >
            <Text className="text-ice text-sm">SMS OTP</Text>
          </Pressable>
        </View>
        {otpId ? (
          <TextInput
            className="bg-panel rounded-2xl px-4 py-3 mt-3 text-ice"
            placeholder="6-digit SMS code"
            placeholderTextColor={colors.mute}
            keyboardType="number-pad"
            maxLength={6}
            value={otpCode}
            onChangeText={setOtpCode}
          />
        ) : null}
        {demoCode ? <Text className="text-xs text-mute mt-2">Dev code: {demoCode}</Text> : null}
        <TextInput
          className="bg-panel rounded-2xl px-4 py-3 mt-3 text-ice"
          placeholder="Password (8+ characters)"
          placeholderTextColor={colors.mute}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Pressable className="flex-row items-start mt-5" onPress={() => setAccepted((value) => !value)}>
          <View className={`w-5 h-5 rounded border mr-3 mt-0.5 ${accepted ? 'bg-brand border-brand' : 'border-mute'}`} />
          <Text className="text-mute flex-1 leading-5">
            I agree to the{' '}
            <Link href="/(auth)/legal-vendor">
              <Text className="text-ice font-semibold">Vendor Terms</Text>
            </Link>
            {', the '}
            <Link href="/(auth)/legal-fees">
              <Text className="text-ice font-semibold">fee schedule</Text>
            </Link>
            {', and the '}
            <Link href="/(auth)/legal-privacy">
              <Text className="text-ice font-semibold">Privacy Notice</Text>
            </Link>
            .
          </Text>
        </Pressable>

        <Pressable
          className="bg-brand rounded-full py-3 mt-6"
          disabled={busy || !otpId || !accepted}
          onPress={async () => {
            if (!accepted) {
              Alert.alert('Terms', 'Accept the Vendor Terms to create a store.')
              return
            }
            setBusy(true)
            try {
              await finish(
                await api.auth.registerVendor({
                  fullName,
                  email,
                  phone,
                  password,
                  otpId,
                  otpCode,
                }),
              )
            } catch (error) {
              Alert.alert('Sign-up failed', error instanceof Error ? error.message : 'Try again')
            } finally {
              setBusy(false)
            }
          }}
        >
          <Text className="text-white text-center font-semibold">{busy ? 'Creating...' : 'Create free store'}</Text>
        </Pressable>

        <AuthRule label="or continue without a password" />
        <NativeAuthMethods
          role="VENDOR"
          purpose="signup"
          email={email}
          firstName={firstName}
          lastName={lastName}
          locked={!accepted}
          onSession={finish}
        />

        <Text className="text-mute text-sm mt-8">
          Already selling?{' '}
          <Link href="/(auth)/vendor-login">
            <Text className="text-ice font-semibold">Merchant sign in</Text>
          </Link>
          {' · '}
          <Link href="/(auth)/register">
            <Text className="text-ice font-semibold">I want to shop</Text>
          </Link>
        </Text>
      </ScrollView>
    </Screen>
  )
}
