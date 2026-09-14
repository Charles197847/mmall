import { Dimensions, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { router } from 'expo-router'
import { mallCourts } from '../../lib/courts'
import { useThemeStore } from '../../stores/themeStore'
import { PressScale } from '../ui/PressScale'
import { SectionHead } from './SectionHead'

const GAP = 14
const SIDE = 20

export function MallDirectory({
  variant = 'walk',
  showHeading = true,
}: {
  variant?: 'walk' | 'index'
  showHeading?: boolean
}) {
  const rule =
    useThemeStore((state) => state.mode) === 'dark' ? 'rgba(232,238,252,0.12)' : 'rgba(11,23,54,0.1)'

  if (variant === 'index') {
    return (
      <View>
        {showHeading ? <SectionHead kicker="The building" title="Courts" /> : null}
        <View className="px-5">
          {mallCourts.map((court, i) => (
            <Pressable
              key={court.id}
              onPress={() => router.push(`/(customer)/browse?court=${court.id}`)}
              className="flex-row items-center py-5"
              style={{ borderBottomWidth: 1, borderBottomColor: rule }}
            >
              <Text className="w-10 text-ice/40" style={{ fontSize: 22, fontWeight: '300' }}>
                {String(i + 1).padStart(2, '0')}
              </Text>
              <View className="flex-1">
                <Text className="text-ice" style={{ fontSize: 22, fontWeight: '300' }}>
                  {court.name}
                </Text>
                <Text className="text-mute text-sm mt-1">
                  {court.level} · {court.line}
                </Text>
              </View>
              <Text className="text-mute text-lg">→</Text>
            </Pressable>
          ))}
        </View>
      </View>
    )
  }

  const width = Dimensions.get('window').width
  const card = Math.round(width * 0.78)
  const offsets = mallCourts.map((_, i) => i * (card + GAP))

  return (
    <View>
      {showHeading ? <SectionHead kicker="Wayfinding" title="Walk a court" /> : null}
      <ScrollView
        horizontal
        nestedScrollEnabled
        directionalLockEnabled
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToOffsets={offsets}
        snapToAlignment="start"
        contentContainerStyle={{ paddingHorizontal: SIDE }}
      >
        {mallCourts.map((court, i) => (
          <PressScale
            key={court.id}
            onPress={() => router.push(`/(customer)/browse?court=${court.id}`)}
            style={{ width: card, marginRight: i === mallCourts.length - 1 ? 0 : GAP }}
            accessibilityRole="button"
            accessibilityLabel={`${court.name}, ${court.level}`}
          >
            <View className="overflow-hidden bg-navy" style={{ height: 280, borderRadius: 28 }}>
              <Image source={{ uri: court.cover }} className="absolute inset-0 w-full h-full" />
              <View className="absolute inset-0 bg-black/30" />
              <Text
                className="absolute top-5 left-5"
                style={{ color: 'rgba(255,255,255,0.28)', fontSize: 56, fontWeight: '300' }}
              >
                {String(i + 1).padStart(2, '0')}
              </Text>
              <View className="absolute bottom-5 left-5 right-5">
                <Text className="text-white/70 text-sm">{court.level}</Text>
                <Text className="text-white mt-0.5" style={{ fontSize: 28, fontWeight: '300' }}>
                  {court.name}
                </Text>
                <Text className="text-white/70 text-sm mt-1">{court.line}</Text>
              </View>
            </View>
          </PressScale>
        ))}
      </ScrollView>
    </View>
  )
}
