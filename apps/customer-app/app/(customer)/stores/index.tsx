import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { api } from '../../../lib/api'
import { mmall } from '../../../lib/theme'

export default function StoresScreen() {
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.vendors.list(),
    staleTime: 60_000,
  })

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-void">
        <ActivityIndicator size="large" color={mmall.glow} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-void">
      <FlatList
        data={vendors ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerClassName="p-3"
        ListHeaderComponent={<Text className="text-2xl font-bold px-1 mb-3 text-ice">All Stores</Text>}
        ListEmptyComponent={<Text className="text-mute px-1">No stores are live yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="w-[48%] mx-[1%] bg-panel rounded-2xl p-4 mb-4 items-center"
            onPress={() => router.push(`/(customer)/vendor/${item.slug}`)}
          >
            {item.logo ? (
              <Image source={{ uri: item.logo }} className="w-20 h-20 rounded-2xl bg-navy" />
            ) : (
              <View className="w-20 h-20 rounded-2xl bg-brand/20 items-center justify-center">
                <Text className="text-2xl font-bold text-glow">{item.storeName[0]}</Text>
              </View>
            )}
            <Text className="font-semibold mt-2 text-center text-ice">{item.storeName}</Text>
            <Text className="text-xs text-mute text-center" numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}
