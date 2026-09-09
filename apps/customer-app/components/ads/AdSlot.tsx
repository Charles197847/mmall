import { useEffect } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import type { AdSlot as Slot } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'

export function AdSlot({ slot }: { slot: Slot }) {
  const { data } = useQuery({
    queryKey: ['ad-slot', slot],
    queryFn: () => api.ads.placements(slot),
    staleTime: 60_000,
  })
  const ad = data?.items?.[0]

  useEffect(() => {
    if (!ad) return
    void api.ads.impression(ad.id).catch(() => undefined)
  }, [ad?.id])

  if (!ad) return null

  return (
    <TouchableOpacity
      className="mx-4 my-3 bg-panel rounded-2xl overflow-hidden"
      onPress={() => {
        void api.ads.click(ad.id).catch(() => undefined)
        if (ad.vendorSlug) router.push(`/(customer)/vendor/${ad.vendorSlug}`)
      }}
    >
      {ad.imageUrl ? (
        <Image source={{ uri: ad.imageUrl }} className="w-full h-36 bg-navy" resizeMode="cover" />
      ) : null}
      <View className="p-3">
        <Text className="text-[10px] tracking-widest text-mute">SPONSORED</Text>
        <Text className="text-ice font-bold mt-1">{ad.title}</Text>
        {ad.headline ? <Text className="text-mute text-sm mt-1">{ad.headline}</Text> : null}
      </View>
    </TouchableOpacity>
  )
}
