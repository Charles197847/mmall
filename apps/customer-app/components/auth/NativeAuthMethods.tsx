import { useState, type ReactNode } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import type { User } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'
import { getPasskey, passkeysAvailable } from '../../lib/passkeys'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import { AuthIcon } from './AuthIcon'

export type AuthMethodKind = 'google' | 'apple' | 'passkey' | 'magic' | 'otp'

export function NativeAuthMethods({
  role = 'CUSTOMER',
  purpose,
  email,
  firstName,
  lastName,
  locked,
  kinds = ['google', 'apple', 'passkey', 'magic', 'otp'],
  onSession,
}: {
  role?: 'CUSTOMER' | 'VENDOR'
  purpose: 'login' | 'signup'
  email: string
  firstName?: string
  lastName?: string
  locked?: boolean
  kinds?: AuthMethodKind[]
  onSession: (result: { token: string; user: User }) => Promise<void> | void
}) {
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const [busy, setBusy] = useState(false)
  const [otpId, setOtpId] = useState('')
  const [code, setCode] = useState('')
  const [hint, setHint] = useState('')
  const keys = passkeysAvailable()
  const show = (kind: AuthMethodKind) => kinds.includes(kind)
  const glyph = mode === 'dark' ? '#E8EEFC' : '#0B1736'
  const terms = role === 'VENDOR' ? 'Vendor Terms' : 'Shopper Terms'

  async function run(task: () => Promise<void>) {
    if (locked) {
      Alert.alert('Terms', `Accept the ${terms} to continue.`)
      return
    }
    setBusy(true)
    try {
      await task()
    } catch (error) {
      Alert.alert('Could not continue', error instanceof Error ? error.message : 'Try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <View className="gap-3">
      {show('google') ? (
        <Method
          disabled={busy || locked}
          tone="google"
          icon={<AuthIcon name="google" color="#1f1f1f" />}
          label="Continue with Google"
          onPress={() =>
            void run(async () => {
              const start = await api.auth.startOAuth('google', role)
              if (start.url) {
                await WebBrowser.openAuthSessionAsync(start.url, 'mmall://')
                return
              }
              if (start.error) throw new Error(start.error)
            })
          }
        />
      ) : null}
      {show('apple') ? (
        <Method
          disabled={busy || locked}
          tone="apple"
          icon={<AuthIcon name="apple" color="#FFFFFF" />}
          label="Continue with Apple"
          onPress={() =>
            void run(async () => {
              const start = await api.auth.startOAuth('apple', role)
              if (start.url) {
                await WebBrowser.openAuthSessionAsync(start.url, 'mmall://')
                return
              }
              if (start.error) throw new Error(start.error)
            })
          }
        />
      ) : null}
      {show('passkey') ? (
        <Method
          disabled={busy || locked || !email || !keys}
          icon={<AuthIcon name="passkey" color={glyph} />}
          label={keys ? 'Continue with a passkey' : 'Passkeys need this browser'}
          onPress={() =>
            void run(async () => {
              const options = await api.auth.passkeyAuthOptions(email)
              const assertion = await getPasskey(options)
              await onSession(await api.auth.passkeyAuthVerify({ email, response: assertion }))
            })
          }
        />
      ) : null}
      {show('magic') ? (
        <Method
          disabled={busy || locked || !email}
          icon={<AuthIcon name="magic" color={glyph} />}
          label="Email a magic link"
          onPress={() =>
            void run(async () => {
              const result = await api.auth.sendMagicLink({ email, purpose, role, firstName, lastName })
              setHint(result.demoLink ? 'Dev link ready. Open it on this phone.' : 'Check your email for the magic link.')
            })
          }
        />
      ) : null}
      {show('otp') ? (
        <Method
          disabled={busy || locked || !email}
          icon={<AuthIcon name="otp" color={glyph} />}
          label="Email a one-time code"
          onPress={() =>
            void run(async () => {
              const result = await api.auth.sendEmailOtp({ email, purpose, role, firstName, lastName })
              setOtpId(result.otpId)
              setHint(result.demoCode ? `Dev code: ${result.demoCode}` : 'We sent a 6-digit code.')
            })
          }
        />
      ) : null}
      {otpId && show('otp') ? (
        <View className="flex-row gap-2">
          <TextInput
            className="flex-1 bg-panel rounded-full px-4 py-3 text-ice"
            placeholder="6-digit code"
            placeholderTextColor={colors.mute}
            keyboardType="number-pad"
            maxLength={6}
            value={code}
            onChangeText={setCode}
          />
          <Pressable
            className="bg-brand rounded-full px-5 justify-center"
            disabled={busy || locked || code.length !== 6}
            onPress={() =>
              void run(async () => {
                await onSession(await api.auth.verifyEmailOtp({ otpId, code }))
              })
            }
          >
            <Text className="text-white font-semibold">Verify</Text>
          </Pressable>
        </View>
      ) : null}
      {hint ? <Text className="text-xs text-mute">{hint}</Text> : null}
      {busy ? <ActivityIndicator color={colors.glow} /> : null}
    </View>
  )
}

function Method({
  label,
  onPress,
  disabled,
  tone = 'plain',
  icon,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  tone?: 'plain' | 'google' | 'apple'
  icon: ReactNode
}) {
  const surface =
    tone === 'google'
      ? 'bg-white border-[#dadce0]'
      : tone === 'apple'
        ? 'bg-black border-black'
        : 'bg-panel border-ice/10'
  const text = tone === 'google' ? 'text-[#1f1f1f]' : tone === 'apple' ? 'text-white' : 'text-ice'

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`h-12 rounded-full flex-row items-center justify-center gap-3 border px-4 ${surface} ${
        disabled ? 'opacity-40' : ''
      }`}
    >
      {icon}
      <Text className={`font-semibold text-sm ${text}`}>{label}</Text>
    </Pressable>
  )
}
