import { Image, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { mallCourts } from '../../lib/courts'

export function MallDirectory() {
  return (
    <View className="px-4">
      <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Directory</Text>
      <Text className="text-2xl font-semibold text-ice mt-1">Walk a court</Text>
      <View className="flex-row flex-wrap mt-4 -mx-1.5">
        {mallCourts.map((court) => (
          <Pressable
            key={court.id}
            className="w-1/2 px-1.5 mb-3"
            onPress={() => router.push(`/(customer)/browse?court=${court.id}`)}
          >
            <View className="overflow-hidden rounded-2xl">
              <Image source={{ uri: court.cover }} className="w-full h-36 bg-navy" />
              <View className="absolute inset-0 bg-black/35" />
              <View className="absolute bottom-3 left-3 right-3">
                <Text className="text-[10px] tracking-[0.2em] text-glow uppercase">{court.level}</Text>
                <Text className="text-ice font-semibold text-base mt-0.5">{court.name}</Text>
                <Text className="text-ice/80 text-xs mt-0.5">{court.line}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
