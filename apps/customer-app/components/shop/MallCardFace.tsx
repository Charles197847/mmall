import { Text, View } from 'react-native'

export const mallCardLooks: Record<string, string> = {
  navy: '#1e40af',
  rose: '#e11d48',
  teal: '#0f766e',
  amber: '#d97706',
  violet: '#7c3aed',
  ink: '#2563eb',
}

export function MallCardFace({
  tone,
  eyebrow,
  title,
  detail,
  badge,
  code,
  large = false,
}: {
  tone: string
  eyebrow: string
  title: string
  detail?: string
  badge: string
  code?: string
  large?: boolean
}) {
  return (
    <View
      className={`relative overflow-hidden rounded-[28px] ${large ? 'p-8' : 'p-5'}`}
      style={{ backgroundColor: mallCardLooks[tone] ?? mallCardLooks.navy, minHeight: large ? 200 : 148 }}
    >
      <View className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <View className="absolute -bottom-12 -left-6 h-28 w-28 rounded-full bg-black/20" />
      <View className="flex-row items-center justify-between">
        <Text className="text-white/70 text-xs">{eyebrow}</Text>
        <Text className="text-white font-bold">{badge}</Text>
      </View>
      <Text className="text-white mt-3" style={{ fontSize: large ? 32 : 24, fontWeight: '300' }}>
        {title}
      </Text>
      {detail ? <Text className="text-white/80 mt-1">{detail}</Text> : null}
      <View className="my-4 border-t border-dashed border-white/40" />
      {code ? <Text className="text-white font-mono text-lg">{code}</Text> : null}
    </View>
  )
}
