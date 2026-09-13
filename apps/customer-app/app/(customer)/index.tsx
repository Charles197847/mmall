import { Image, Pressable, ScrollView, Text, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { BrandMark } from '../../components/brand/BrandMark'
import { DeliverTo } from '../../components/mall/DeliverTo'
import { MallDirectory } from '../../components/mall/MallDirectory'
import { StoreWindow } from '../../components/mall/StoreWindow'
import { HeroDrop } from '../../components/mall/HeroDrop'
import { loadVendors } from '../../lib/catalog'
import { mallSpecials } from '../../lib/mallOffers'

export default function HomeScreen() {
  const { user } = useAuth()
  const stores = useQuery({
    queryKey: ['vendors'],
    queryFn: () => loadVendors(),
    staleTime: 60_000,
  })

  const drop = mallSpecials()[0]
  const windows = (stores.data ?? []).slice(0, 3)

  return (
    <ScrollView className="flex-1 bg-void" nestedScrollEnabled contentContainerClassName="pb-14">
      <View>
        <Image
          source={require('../../assets/mmall-web-banner.png')}
          className="w-full h-52 bg-navy"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />
        <View className="absolute top-12 left-4 right-4 flex-row items-center justify-between">
          <BrandMark />
          <Pressable
            onPress={() => router.push(user ? '/(customer)/profile' : '/(auth)/login')}
            className="px-3 py-1.5"
          >
            <Text className="text-ice text-sm">{user ? user.firstName : 'Sign in'}</Text>
          </Pressable>
        </View>
        <View className="absolute bottom-4 left-4 right-4">
          <Text className="text-[11px] tracking-[0.28em] text-glow uppercase">Open now</Text>
          <Text className="text-ice text-3xl font-semibold mt-1">The mall is live</Text>
          <View className="flex-row items-end justify-between mt-3">
            <DeliverTo />
            <Pressable onPress={() => router.push('/(customer)/browse')} className="border-b border-ice/40 pb-0.5">
              <Text className="text-ice text-sm">Search</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mt-8">
        <MallDirectory />
      </View>

      {drop ? (
        <View className="mt-10">
          <HeroDrop product={drop} />
        </View>
      ) : null}

      <View className="mt-12">
        <View className="px-4 mb-4 flex-row items-end justify-between">
          <View>
            <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Storefronts</Text>
            <Text className="text-2xl font-semibold text-ice mt-1">Open tonight</Text>
          </View>
          <Pressable onPress={() => router.push('/(customer)/stores')}>
            <Text className="text-glow text-sm">All shops</Text>
          </Pressable>
        </View>
        {windows.map((vendor) => (
          <StoreWindow key={vendor.id} vendor={vendor} />
        ))}
      </View>
    </ScrollView>
  )
}
