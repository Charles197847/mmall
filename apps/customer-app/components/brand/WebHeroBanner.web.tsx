import { Image, View } from 'react-native'

const BANNER = require('../../assets/mmall-web-banner.png')

export function WebHeroBanner() {
  return (
    <View nativeID="mm-web-hero" className="mm-hero-banner" style={{ width: '100%' }}>
      <Image
        source={BANNER}
        accessibilityLabel="M-Mall, your digital shopping mall"
        style={{ width: '100%', height: 132 }}
        resizeMode="cover"
      />
    </View>
  )
}
