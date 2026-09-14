import { Text, View } from 'react-native'

export function AuthRule({ label }: { label: string }) {
  return (
    <View className="my-7 flex-row items-center gap-3">
      <View className="h-px flex-1 bg-ice/10" />
      <Text className="text-xs text-mute">{label}</Text>
      <View className="h-px flex-1 bg-ice/10" />
    </View>
  )
}
