import type { ReactNode } from 'react'
import { Text, View } from 'react-native'

export function SectionHead({
  kicker,
  title,
  action,
}: {
  kicker: string
  title: string
  action?: ReactNode
}) {
  return (
    <View className="px-5 mb-6 flex-row items-end justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-[12px] text-mute">{kicker}</Text>
        <Text className="text-ice mt-1" style={{ fontSize: 34, lineHeight: 40, fontWeight: '300' }}>
          {title}
        </Text>
      </View>
      {action}
    </View>
  )
}
