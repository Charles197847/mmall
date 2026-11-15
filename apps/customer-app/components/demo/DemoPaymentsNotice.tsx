import { Platform, Text, View } from 'react-native'

export function DemoPaymentsNotice() {
  if (Platform.OS !== 'web' || process.env.EXPO_PUBLIC_DEMO_PAYMENTS !== 'true') return null
  return (
    <View accessibilityRole="text" style={{ backgroundColor: '#122044', paddingVertical: 6, paddingHorizontal: 12 }}>
      <Text style={{ color: '#8BA0C9', textAlign: 'center', fontSize: 12 }}>Demo — payments are simulated</Text>
    </View>
  )
}
