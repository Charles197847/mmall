import { useEffect } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../lib/api'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.products.get(id),
    enabled: Boolean(id),
    staleTime: 60_000,
  })

  useEffect(() => {
    if (product?.vendor?.slug) {
      router.replace(`/(customer)/vendor/${product.vendor.slug}?product=${product.id}`)
    }
  }, [product])

  return (
    <View className="flex-1 justify-center items-center bg-void">
      {isLoading || product?.vendor?.slug ? (
        <ActivityIndicator size="large" color={colors.glow} />
      ) : (
        <Text className="text-ice">Product not found</Text>
      )}
    </View>
  )
}
