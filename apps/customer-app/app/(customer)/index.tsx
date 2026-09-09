import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Link, router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth/AuthProvider'
import { productImage } from '../../lib/utils/images'
import { storeHref } from '../../lib/navigation/store'
import { BrandMark } from '../../components/brand/BrandMark'
import { ThemeToggle } from '../../components/theme/ThemeToggle'
import { GlowRule } from '../../components/ui/GlowRule'
import { AdSlot } from '../../components/ads/AdSlot'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

const categories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Home', icon: '🏠' },
  { name: 'Books', icon: '📚' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Sports', icon: '⚽' },
  { name: 'Outdoor', icon: '🏕️' },
]

export default function HomeScreen() {
  const { user } = useAuth()
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]

  const { data, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.products.list({ page: 1 }),
    staleTime: 60_000,
  })

  const products = data?.items?.slice(0, 6) ?? []

  return (
    <ScrollView className="flex-1 bg-void">
      <View className="bg-navy px-4 pt-12 pb-6">
        <View className="flex-row justify-between items-center mb-5">
          <BrandMark />
          <View className="flex-row items-center gap-2">
            <ThemeToggle />
            <TouchableOpacity onPress={() => router.push('/(customer)/profile')}>
              <View className="w-11 h-11 bg-brand rounded-full items-center justify-center">
                <Text className="text-white font-bold">{user?.firstName?.[0] || 'G'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-mute text-xs tracking-widest mb-1">WELCOME BACK</Text>
        <Text className="text-ice text-2xl font-bold mb-4">{user?.firstName || 'Guest'}</Text>

        <TouchableOpacity
          onPress={() => router.push('/(customer)/browse')}
          className="bg-panel rounded-2xl px-4 py-3 flex-row items-center"
        >
          <Feather name="search" size={20} color={colors.mute} />
          <Text className="text-mute ml-2">Search the grid...</Text>
        </TouchableOpacity>
      </View>
      <GlowRule />
      <AdSlot slot="HOMEPAGE_BANNER" />

      <View className="mt-5">
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4"
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="items-center mr-4"
              onPress={() => router.push(`/(customer)/browse?category=${item.name}`)}
            >
              <View className="w-16 h-16 bg-panel rounded-2xl items-center justify-center">
                <Text className="text-3xl">{item.icon}</Text>
              </View>
              <Text className="text-xs mt-1 text-mute">{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View className="mt-6 px-4 pb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-ice">Featured</Text>
          <TouchableOpacity onPress={() => router.push('/(customer)/browse')}>
            <Text className="text-glow">See all</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <Text className="text-mute">Loading catalog...</Text>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {products.map((item) => (
              <Link key={item.id} href={storeHref(item)} asChild>
                <TouchableOpacity className="w-[48%] bg-panel rounded-2xl p-3 mb-3">
                  <Image
                    source={{ uri: productImage(item.images?.[0]) }}
                    className="w-full h-32 rounded-xl bg-navy"
                    resizeMode="cover"
                  />
                  <Text className="font-semibold text-sm mt-2 text-ice" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-glow font-bold">R{item.price.toFixed(2)}</Text>
                  <Text className="text-xs text-mute">{item.vendor?.storeName}</Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  )
}
