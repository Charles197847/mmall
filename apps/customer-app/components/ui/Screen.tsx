import { SafeAreaView } from 'react-native-safe-area-context'
import { View, type ViewProps } from 'react-native'

export function Screen({ children, className, ...props }: ViewProps & { className?: string }) {
  return (
    <SafeAreaView className="flex-1 bg-void">
      <View className={className ?? 'flex-1'} {...props}>
        {children}
      </View>
    </SafeAreaView>
  )
}
