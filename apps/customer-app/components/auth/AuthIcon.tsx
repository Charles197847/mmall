import { Image } from 'react-native'
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons'

export function AuthIcon({
  name,
  color,
}: {
  name: 'google' | 'apple' | 'passkey' | 'magic' | 'otp'
  color: string
}) {
  if (name === 'google') {
    return (
      <Image
        source={require('../../assets/auth/google.png')}
        style={{ width: 20, height: 20 }}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
    )
  }
  if (name === 'apple') {
    return <FontAwesome name="apple" size={20} color={color} />
  }
  const glyph = name === 'passkey' ? 'account-key-outline' : name === 'magic' ? 'email-fast-outline' : 'numeric'
  return <MaterialCommunityIcons name={glyph} size={20} color={color} />
}
