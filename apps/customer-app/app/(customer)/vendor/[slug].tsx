import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import type { Product } from '@shopping-mall/shared-types'
import { api } from '../../../lib/api'
import { ProductCard } from '../../../components/product/ProductCard'
import { ProductRail } from '../../../components/product/ProductRail'
import { useCartStore } from '../../../stores/cartStore'
import { productImage } from '../../../lib/utils/images'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'
import { AdSlot } from '../../../components/ads/AdSlot'

function withStoreVendor(product: Product, vendor: { id: string; storeName: string; slug: string; logo: string | null }) {
  return {
    ...product,
    vendor: product.vendor ?? {
      id: vendor.id,
      storeName: vendor.storeName,
      slug: vendor.slug,
      logo: vendor.logo,
    },
  }
}

export default function VendorStoreScreen() {
  const { slug, product: focusId } = useLocalSearchParams<{ slug: string; product?: string }>()
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const addItem = useCartStore((state) => state.addItem)
  const isInCart = useCartStore((state) => state.isInCart)
  const [category, setCategory] = useState('')

  const { data: vendor, isLoading } = useQuery({
    queryKey: ['vendor', slug],
    queryFn: () => api.vendors.get(slug),
    enabled: Boolean(slug),
  })

  const catalog = useMemo(() => {
    if (!vendor) return []
    return (vendor.products ?? []).map((item) => withStoreVendor(item, vendor))
  }, [vendor])

  const categories = useMemo(() => {
    const unique = new Set(catalog.map((item) => item.category).filter(Boolean) as string[])
    return ['All', ...Array.from(unique)]
  }, [catalog])

  const focused = catalog.find((item) => item.id === focusId) ?? catalog[0]
  const visible = catalog.filter((item) => {
    if (focused && item.id === focused.id) return false
    if (!category || category === 'All') return true
    return item.category === category
  })

  const likeCategory = category && category !== 'All' ? category : focused?.category ?? undefined

  const { data: moreLike } = useQuery({
    queryKey: ['you-might-like', vendor?.id, likeCategory],
    queryFn: async () => {
      const preferred = likeCategory
        ? await api.products.list({
            category: likeCategory,
            excludeVendorId: vendor?.id,
            page: 1,
            limit: 8,
          })
        : { items: [] as Product[] }
      if ((preferred.items?.length ?? 0) >= 4) return preferred
      const fallback = await api.products.list({
        excludeVendorId: vendor?.id,
        page: 1,
        limit: 8,
      })
      const seen = new Set((preferred.items ?? []).map((item) => item.id))
      const merged = [...(preferred.items ?? [])]
      for (const item of fallback.items ?? []) {
        if (seen.has(item.id)) continue
        merged.push(item)
        seen.add(item.id)
      }
      return { items: merged }
    },
    enabled: Boolean(vendor?.id),
    staleTime: 60_000,
  })

  const otherStoreItems = (moreLike?.items ?? [])
    .filter((item) => item.vendorId !== vendor?.id && item.id !== focused?.id)
    .slice(0, 8)

  const handleAddFocused = () => {
    if (!focused || !vendor) return
    addItem({
      productId: focused.id,
      name: focused.name,
      price: focused.price,
      image: productImage(focused.images?.[0]),
      vendorId: vendor.id,
      vendorName: vendor.storeName,
      maxQuantity: focused.inventory,
      quantity: 1,
    })
    Alert.alert('Added to cart', `${focused.name} is in your bag.`)
  }

  if (isLoading || !vendor) {
    return (
      <View className="flex-1 items-center justify-center bg-void">
        {isLoading ? <ActivityIndicator size="large" color={colors.glow} /> : <Text className="text-ice">Store not found</Text>}
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-void" nestedScrollEnabled contentContainerClassName="pb-10">
      {vendor.coverImage ? (
        <Image source={{ uri: vendor.coverImage }} className="w-full h-36 bg-navy" resizeMode="cover" />
      ) : null}

      <View className="p-4 bg-navy">
        <View className="flex-row items-center">
          {vendor.logo ? (
            <Image source={{ uri: vendor.logo }} className="w-14 h-14 rounded-2xl bg-panel mr-3" />
          ) : (
            <View className="w-14 h-14 rounded-2xl bg-brand/20 items-center justify-center mr-3">
              <Text className="text-2xl font-bold text-glow">{vendor.storeName[0]}</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-2xl font-bold text-ice">{vendor.storeName}</Text>
            <Text className="text-mute mt-1">{vendor.description}</Text>
          </View>
        </View>
      </View>

      <AdSlot slot="SHOP_HIGHLIGHT" />

      {focused ? (
        <View className="px-4 pt-4">
          <Text className="text-xs tracking-widest text-mute mb-2">SELECTED ITEM</Text>
          <View className="bg-panel rounded-2xl overflow-hidden">
            <Image
              source={{ uri: productImage(focused.images?.[0]) }}
              className="w-full h-56 bg-navy"
              resizeMode="cover"
            />
            <View className="p-4">
              <Text className="text-xl font-bold text-ice">{focused.name}</Text>
              {focused.category ? <Text className="text-mute mt-1">{focused.category}</Text> : null}
              <Text className="text-2xl font-bold text-glow mt-2">R{focused.price.toFixed(2)}</Text>
              <Text className="text-mute mt-2" numberOfLines={3}>
                {focused.description}
              </Text>
              <TouchableOpacity
                className={`mt-4 py-3 rounded-2xl ${isInCart(focused.id) ? 'bg-navy' : 'bg-signal'}`}
                onPress={handleAddFocused}
                disabled={isInCart(focused.id)}
                accessibilityRole="button"
                accessibilityLabel={isInCart(focused.id) ? `${focused.name} already in bag` : `Add ${focused.name} to bag`}
              >
                <Text className="text-white text-center font-bold">
                  {isInCart(focused.id) ? 'Already in bag' : 'Add to bag'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      <View className="px-4 mt-6">
        <Text className="text-xl font-bold text-ice mb-3">Shop by category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((item) => {
            const active = (category || 'All') === item
            return (
              <TouchableOpacity
                key={item}
                className={`mr-2 px-4 py-2 rounded-full ${active ? 'bg-brand' : 'bg-panel'}`}
                onPress={() => setCategory(item === 'All' ? '' : item)}
              >
                <Text className={active ? 'text-white font-semibold' : 'text-mute'}>{item}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <View className="px-2 mt-4">
        <Text className="text-xl font-bold text-ice px-2 mb-2">
          {category && category !== 'All' ? category : 'All store items'}
        </Text>
        {visible.length ? (
          <View className="flex-row flex-wrap">
            {visible.map((item) => (
              <View key={item.id} className="w-1/2">
                <ProductCard product={item} />
              </View>
            ))}
          </View>
        ) : (
          <Text className="text-mute px-2">No items in this category yet.</Text>
        )}
      </View>

      <ProductRail
        title="You might also like"
        subtitle="More from other MMall stores"
        products={otherStoreItems}
        onSeeAll={
          likeCategory ? () => router.push(`/(customer)/browse?category=${likeCategory}`) : undefined
        }
      />
    </ScrollView>
  )
}
