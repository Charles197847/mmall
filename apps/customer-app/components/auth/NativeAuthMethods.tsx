import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from 'react-native'
import type { User } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'
import { getPasskey, passkeysAvailable } from '../../lib/passkeys'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

export function NativeAuthMethods({
  purpose,
  email,
  firstName,
  lastName,
  locked,
  onSession,
}: {
  purpose: 'login' | 'signup'
  email: string
  firstName?: string
  lastName?: string
  locked?: boolean
  onSession: (result: { token: string; user: User }) => Promise<void> | void
}) {
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const [busy, setBusy] = useState(false)
  const [otpId, setOtpId] = useState('')
  const [code, setCode] = useState('')
  const [hint, setHint] = useState('')
  const keys = passkeysAvailable()

  async function run(task: () => Promise<void>) {
    if (locked) {
      Alert.alert('Terms', 'Accept the Shopper Terms to continue.')
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
      <Method
        disabled={busy || locked}
        label="Continue with Google"
        onPress={() =>
          void run(async () => {
            await api.auth.startOAuth('google')
          })
        }
      />
      <Method
        disabled={busy || locked}
        dark
        label="Continue with Apple"
        onPress={() =>
          void run(async () => {
            await api.auth.startOAuth('apple')
          })
        }
      />
      <Method
        disabled={busy || locked || !email || !keys}
        label={keys ? 'Continue with a passkey' : 'Passkeys need this browser'}
        onPress={() =>
          void run(async () => {
            const options = await api.auth.passkeyAuthOptions(email)
            const assertion = await getPasskey(options)
            await onSession(await api.auth.passkeyAuthVerify({ email, response: assertion }))
          })
        }
      />
      <Method
        disabled={busy || locked || !email}
        label="Email a magic link"
        onPress={() =>
          void run(async () => {
            const result = await api.auth.sendMagicLink({ email, purpose, firstName, lastName })
            setHint(result.demoLink ? `Dev link ready. Open it on this phone.` : 'Check your email for the magic link.')
          })
        }
      />
      <Method
        disabled={busy || locked || !email}
        label="Email a one-time code"
        onPress={() =>
          void run(async () => {
            const result = await api.auth.sendEmailOtp({ email, purpose, firstName, lastName })
            setOtpId(result.otpId)
            setHint(result.demoCode ? `Dev code: ${result.demoCode}` : 'We sent a 6-digit code.')
          })
        }
      />
      {otpId ? (
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
  dark,
}: {
  label: string
  onPress: () => void
  disabled?: boolean
  dark?: boolean
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`h-12 rounded-full items-center justify-center border ${
        dark ? 'bg-black border-black' : 'bg-panel border-glow/20'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <Text className={`font-semibold ${dark ? 'text-white' : 'text-ice'}`}>{label}</Text>
    </Pressable>
  )
}
