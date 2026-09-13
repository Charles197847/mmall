import type { PropsWithChildren } from 'react'
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function PressScale({
  children,
  style,
  ...props
}: PropsWithChildren<PressableProps & { style?: StyleProp<ViewStyle> }>) {
  const scale = useSharedValue(1)
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      {...props}
      style={[style, animated]}
      onPressIn={(event) => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 320 })
        props.onPressIn?.(event)
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, { damping: 16, stiffness: 260 })
        props.onPressOut?.(event)
      }}
    >
      {children}
    </AnimatedPressable>
  )
}
