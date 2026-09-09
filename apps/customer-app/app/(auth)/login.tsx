import { useState } from 'react'
import { Alert, Pressable, Text, TextInput, View } from 'react-native'
import { Link, router } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { Screen } from '../../components/ui/Screen'
import { BrandMark } from '../../components/brand/BrandMark'
import { ThemeToggle } from '../../components/theme/ThemeToggle'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('customer@shopping-mall.local')
  const [password, setPassword] = useState('Password123!')
  const [loading, setLoading] = useState(false)
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]

  const onSubmit = async () => {
    setLoading(true)
    try {
      await login(email, password)
      router.replace('/(customer)')
    } catch (error) {
      Alert.alert('Login failed', error instanceof Error ? error.message : 'Try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen className="flex-1 p-6 justify-center">
      <View className="absolute top-6 right-6">
        <ThemeToggle />
      </View>
      <BrandMark />
      <Text className="text-ice text-3xl font-bold mt-8 mb-2">Enter the grid</Text>
      <Text className="text-mute mb-8">Sign in to MMall to shop, track, and check out.</Text>
      <TextInput
        className="bg-panel rounded-2xl px-4 py-3 mb-3 text-ice"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor={colors.mute}
      />
      <TextInput
        className="bg-panel rounded-2xl px-4 py-3 mb-6 text-ice"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor={colors.mute}
      />
      <Pressable className="bg-brand rounded-2xl py-3" onPress={onSubmit} disabled={loading}>
        <Text className="text-white text-center font-bold">{loading ? 'Signing in...' : 'Sign in'}</Text>
      </Pressable>
      <View className="mt-4">
        <Link href="/(auth)/register">
          <Text className="text-glow">Create an account</Text>
        </Link>
      </View>
    </Screen>
  )
}
