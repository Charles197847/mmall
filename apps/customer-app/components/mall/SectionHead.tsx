import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { layout } from '../../lib/layout'

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
    <View className="px-4 mb-4 flex-row items-end justify-between">
      <View className="flex-1 pr-4">
        <Text className="text-xs text-mute">{kicker}</Text>
        <Text className="text-ice mt-0.5" style={{ fontSize: layout.title, lineHeight: layout.titleLine, fontWeight: '300' }}>
          {title}
        </Text>
      </View>
      {action}
    </View>
  )
}
