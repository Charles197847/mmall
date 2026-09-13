import { Image, Text, View } from 'react-native'

const photos = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&q=80',
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80',
]

export function AdBand({ label }: { label: string }) {
  return (
    <View className="mb-10 px-4">
      <Text className="mb-3 text-[10px] tracking-[0.2em] text-mute">SPONSORED</Text>
      <View>
        <Image source={{ uri: photos[label.length % photos.length] }} className="w-full h-44 rounded-2xl bg-navy" />
        <Text className="mt-3 text-[11px] tracking-[0.22em] text-glow">SPONSORED</Text>
        <Text className="mt-1.5 text-lg font-semibold text-ice">{label}</Text>
        <Text className="mt-1 text-sm text-mute">From shops on the MMall grid.</Text>
      </View>
    </View>
  )
}
