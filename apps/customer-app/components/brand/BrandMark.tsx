import { Image, View } from 'react-native'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const bag = compact ? 36 : 48
  return (
    <View className="flex-row items-center">
      <Image
        source={require('../../assets/mmall-bag.png')}
        style={{ width: bag, height: bag }}
        resizeMode="contain"
        accessibilityLabel=""
      />
      <Image
        source={require('../../assets/mmall-wordmark.png')}
        style={{ height: compact ? 22 : 28, width: compact ? 92 : 118, marginLeft: 8 }}
        resizeMode="contain"
        accessibilityLabel="M-MALL"
      />
    </View>
  )
}
