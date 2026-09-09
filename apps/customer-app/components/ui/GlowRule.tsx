import { View } from 'react-native'

export function GlowRule() {
  return (
    <View
      style={{
        height: 2,
        marginHorizontal: 16,
        borderRadius: 99,
        backgroundColor: 'rgba(47, 107, 255, 0.22)',
        // @ts-expect-error web-only glow fade
        backgroundImage:
          'linear-gradient(90deg, transparent, rgba(61,232,255,0.55), rgba(47,107,255,0.7), rgba(61,232,255,0.55), transparent)',
        boxShadow: '0 0 18px rgba(61, 232, 255, 0.25)',
      }}
    />
  )
}
