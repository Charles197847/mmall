import { Image, View } from 'react-native'

export function BrandMark({ compact = false, onDark = false }: { compact?: boolean; onDark?: boolean }) {
  const bag = compact ? 28 : 48
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
        style={[
          { height: compact ? 18 : 28, width: compact ? 76 : 118, marginLeft: 6 },
          onDark ? { tintColor: '#FFFFFF' } : null,
        ]}
        resizeMode="contain"
        accessibilityLabel="M-MALL"
      />
    </View>
  )
}
