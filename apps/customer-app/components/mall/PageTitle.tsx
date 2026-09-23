import { Text, View } from 'react-native'
import { layout } from '../../lib/layout'

export function PageTitle({
  kicker,
  title,
  lede,
}: {
  kicker?: string
  title: string
  lede?: string
}) {
  return (
    <View className="px-4 mb-3">
      {kicker ? <Text className="text-mute text-xs">{kicker}</Text> : null}
      <Text
        className="text-ice mt-0.5"
        style={{ fontSize: layout.title, lineHeight: layout.titleLine, fontWeight: '300' }}
      >
        {title}
      </Text>
      {lede ? <Text className="text-mute text-sm mt-1.5 leading-5">{lede}</Text> : null}
    </View>
  )
}
