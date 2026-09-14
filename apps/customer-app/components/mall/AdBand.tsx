import { Image, Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import { mockAds } from '../../lib/catalog'

export function AdBand({ label }: { label: string }) {
  const items = mockAds(label, 2)

  return (
    <View className="mb-6 px-4">
      <Text className="mb-3 text-[10px] tracking-[0.2em] text-mute">SPONSORED</Text>
      {items.map((ad) => (
        <Pressable
          key={ad.id}
          className="mb-5"
          onPress={() => {
            if (ad.vendorSlug) router.push(`/(customer)/vendor/${ad.vendorSlug}`)
          }}
        >
          <Image source={{ uri: ad.imageUrl }} className="w-full h-44 rounded-2xl bg-navy" />
          <Text className="mt-3 text-[11px] tracking-[0.22em] text-glow">SPONSORED</Text>
          <Text className="mt-1.5 text-lg font-semibold text-ice">{ad.title}</Text>
          {ad.headline ? <Text className="mt-1 text-sm text-mute">{ad.headline}</Text> : null}
        </Pressable>
      ))}
    </View>
  )
}
