import { useState } from 'react'
import { Alert, Pressable, Text, TextInput } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { Screen } from '../../components/ui/Screen'
import { BrandMark } from '../../components/brand/BrandMark'
import { mmall } from '../../lib/theme'

export default function RegisterScreen() {
  const { register } = useAuth()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async () => {
    setLoading(true)
    try {
      await register({ email, password, firstName, lastName })
      router.replace('/(customer)')
    } catch (error) {
      Alert.alert('Registration failed', error instanceof Error ? error.message : 'Try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen className="flex-1 p-6 justify-center">
      <BrandMark />
      <Text className="text-ice text-3xl font-bold mt-8 mb-6">Join MMall</Text>
      <TextInput
        className="bg-panel rounded-2xl px-4 py-3 mb-3 text-ice"
        placeholder="First name"
        placeholderTextColor={mmall.mute}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        className="bg-panel rounded-2xl px-4 py-3 mb-3 text-ice"
        placeholder="Last name"
        placeholderTextColor={mmall.mute}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        className="bg-panel rounded-2xl px-4 py-3 mb-3 text-ice"
        placeholder="Email"
        placeholderTextColor={mmall.mute}
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="bg-panel rounded-2xl px-4 py-3 mb-6 text-ice"
        placeholder="Password"
        placeholderTextColor={mmall.mute}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Pressable className="bg-brand rounded-2xl py-3" onPress={onSubmit} disabled={loading}>
        <Text className="text-white text-center font-bold">{loading ? 'Creating...' : 'Create account'}</Text>
      </Pressable>
    </Screen>
  )
}
