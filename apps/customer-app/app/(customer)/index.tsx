import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth/AuthProvider'
import { BrandMark } from '../../components/brand/BrandMark'
import { ThemeToggle } from '../../components/theme/ThemeToggle'
import { GlowRule } from '../../components/ui/GlowRule'
import { AdSlot } from '../../components/ads/AdSlot'
import { ProductRail } from '../../components/product/ProductRail'
import { StoreRail } from '../../components/vendor/StoreRail'
import { WebHeroBanner } from '../../components/brand/WebHeroBanner'
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

function SearchBar({ colors }: { colors: (typeof palettes)[keyof typeof palettes] }) {
  return (
    <TouchableOpacity
      onPress={() => router.push('/(customer)/browse')}
      className="flex-1 bg-panel rounded-2xl px-4 py-2.5 flex-row items-center"
    >
      <Feather name="search" size={18} color={colors.mute} />
      <Text className="text-mute ml-2" numberOfLines={1}>
        Search the grid...
      </Text>
    </TouchableOpacity>
  )
}

export default function HomeScreen() {
  const { user } = useAuth()
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const web = Platform.OS === 'web'

  const featured = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => api.products.list({ page: 1, limit: 12 }),
    staleTime: 60_000,
  })

  const electronics = useQuery({
    queryKey: ['home-electronics'],
    queryFn: () => api.products.list({ category: 'Electronics', page: 1, limit: 12 }),
    staleTime: 60_000,
  })

  const stores = useQuery({
    queryKey: ['vendors'],
    queryFn: () => api.vendors.list(),
    staleTime: 60_000,
  })

  return (
    <ScrollView
      className="flex-1 bg-void"
      nestedScrollEnabled
      contentContainerStyle={{ flexGrow: 0 }}
    >
      {web ? (
        <WebHeroBanner />
      ) : (
        <>
          <View className="bg-navy px-4 pt-12 pb-3">
            <View className="flex-row items-center gap-3">
              <BrandMark />
              <View style={{ flex: 1 }}>
                <SearchBar colors={colors} />
              </View>
              <ThemeToggle />
              <TouchableOpacity onPress={() => router.push('/(customer)/profile')}>
                <View className="w-10 h-10 bg-brand rounded-full items-center justify-center">
                  <Text className="text-white font-bold">{user?.firstName?.[0] || 'G'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <GlowRule />
          <AdSlot slot="HOMEPAGE_BANNER" />
        </>
      )}

      {web ? (
        <View className="px-4 py-3 bg-navy flex-row items-center gap-3">
          <View style={{ flex: 1 }}>
            <SearchBar colors={colors} />
          </View>
          <ThemeToggle />
          <TouchableOpacity onPress={() => router.push('/(customer)/profile')}>
            <View className="w-10 h-10 bg-brand rounded-full items-center justify-center">
              <Text className="text-white font-bold">{user?.firstName?.[0] || 'G'}</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        className="mt-5"
        style={{ flexGrow: 0 }}
        contentContainerClassName="px-4"
      >
        {categories.map((item) => (
          <TouchableOpacity
            key={item.name}
            className="items-center mr-4"
            onPress={() => router.push(`/(customer)/browse?category=${item.name}`)}
          >
            <View className="w-16 h-16 bg-panel rounded-2xl items-center justify-center">
              <Text className="text-3xl">{item.icon}</Text>
            </View>
            <Text className="text-xs mt-1 text-mute">{item.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ProductRail
        title="Featured"
        products={featured.data?.items ?? []}
        loading={featured.isLoading}
        onSeeAll={() => router.push('/(customer)/browse')}
      />

      <ProductRail
        title="Electronics"
        products={electronics.data?.items ?? []}
        loading={electronics.isLoading}
        onSeeAll={() => router.push('/(customer)/browse?category=Electronics')}
      />

      <StoreRail
        title="Stores"
        subtitle="Visit a branded shop"
        vendors={stores.data ?? []}
        loading={stores.isLoading}
        onSeeAll={() => router.push('/(customer)/stores/')}
      />

      <View className="h-8" />
    </ScrollView>
  )
}
