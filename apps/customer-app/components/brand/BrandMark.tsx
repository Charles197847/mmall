import { Image, Text, View } from 'react-native'

export function BrandMark({ compact = false }: { compact?: boolean }) {
  const size = compact ? 40 : 56
  return (
    <View className="flex-row items-center">
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: size, height: size, borderRadius: compact ? 12 : 16 }}
      />
      <View className="ml-3">
        <Text className={`text-ice font-bold tracking-widest ${compact ? 'text-lg' : 'text-2xl'}`}>MMall</Text>
        {compact ? null : <Text className="text-mute text-[11px] tracking-widest">COMMERCE GRID 2030</Text>}
      </View>
    </View>
  )
}
