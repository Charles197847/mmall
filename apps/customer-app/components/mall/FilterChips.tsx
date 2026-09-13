import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { mallCategories } from '../../lib/mallCategories'

export function FilterChips({
  category,
  onChange,
}: {
  category: string
  onChange: (name: string) => void
}) {
  return (
    <View className="mb-10 px-4">
      <Text className="text-xl font-semibold text-ice">Filter</Text>
      <Text className="text-sm text-mute mt-1 mb-3">
        {category ? category : 'Open a court to filter the listings below.'}
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
        {mallCategories.map((item) => {
          const active = category === item.name
          return (
            <TouchableOpacity
              key={item.name}
              onPress={() => onChange(active ? '' : item.name)}
              className={`rounded-full px-3 py-1.5 ${active ? 'bg-brand' : 'bg-black/20'}`}
            >
              <Text className={`text-sm ${active ? 'text-white' : 'text-ice'}`}>
                {item.icon} {item.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
