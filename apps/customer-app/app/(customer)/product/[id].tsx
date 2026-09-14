import { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { loadProduct, loadProducts } from '../../../lib/catalog'
import { reviewsFromApi } from '../../../lib/productDetail'
import { useCartStore } from '../../../stores/cartStore'
import { LoveButton } from '../../../components/product/LoveButton'
import { ProductRail } from '../../../components/product/ProductRail'
import { formatMoney } from '../../../lib/utils/format'
import { productImage } from '../../../lib/utils/images'
import { ShopPromises } from '../../../components/mall/ShopPromises'
import { MallChrome } from '../../../components/mall/MallChrome'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

function Stars({ value }: { value: number }) {
  const rounded = Math.round(value)
  return <Text className="text-glow">{'★'.repeat(rounded)}{'☆'.repeat(Math.max(0, 5 - rounded))}</Text>
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const addItem = useCartStore((state) => state.addItem)
  const inCart = useCartStore((state) => state.isInCart)
  const [photo, setPhoto] = useState(0)
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => loadProduct(id!),
    enabled: Boolean(id),
    staleTime: 60_000,
  })

  const item = productQuery.data
  const reviews = item ? reviewsFromApi(item) : []

  const related = useQuery({
    queryKey: ['related', item?.category, item?.id],
    queryFn: () => loadProducts({ category: item?.category ?? undefined, limit: 10 }),
    enabled: Boolean(item?.category),
    staleTime: 60_000,
  })

  const relatedItems = useMemo(
    () => (related.data?.items ?? []).filter((row) => row.id !== item?.id).slice(0, 8),
    [related.data, item?.id],
  )

  if (productQuery.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-void">
        <ActivityIndicator size="large" color={colors.glow} />
      </View>
    )
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center bg-void px-6">
        <Text className="text-ice text-lg font-semibold">This listing is not available.</Text>
        <Pressable className="mt-4 bg-brand rounded-2xl px-5 py-3" onPress={() => router.push('/(customer)/browse')}>
          <Text className="text-white font-bold">Browse the mall</Text>
        </Pressable>
      </View>
    )
  }

  const addToBag = (buyNow = false) => {
    const options = item.options ?? []
    const selected = Object.fromEntries(
      options.map((option) => [option.name, picks[option.name] ?? '']),
    )
    if (options.some((option) => !selected[option.name])) {
      Alert.alert('Options', 'Choose the available options first.')
      return
    }
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      image: productImage(item.images?.[0]),
      vendorId: item.vendorId,
      vendorName: item.vendor?.storeName ?? 'MMall',
      maxQuantity: Math.min(8, item.inventory || 99),
      quantity,
      options: options.length ? selected : undefined,
    })
    if (buyNow) {
      router.push('/(customer)/cart/checkout')
      return
    }
    Alert.alert('Added to bag', `${item.name} is in your cart.`)
  }

  const already = inCart(item.id, picks)

  return (
    <ScrollView className="flex-1 bg-void" contentContainerClassName="pb-12">
      <MallChrome />
      <View className="px-4 py-3">
        <Pressable onPress={() => router.push('/(customer)')}>
          <Text className="text-mute text-sm">Mall</Text>
        </Pressable>
        {item.category ? (
          <Pressable onPress={() => router.push(`/(customer)/browse?category=${item.category}`)}>
            <Text className="text-mute text-sm"> / {item.category}</Text>
          </Pressable>
        ) : null}
      </View>
      <View>
        <Image
          source={{ uri: productImage(item.images?.[photo] ?? item.images?.[0]) }}
          className="w-full h-80 bg-navy"
          resizeMode="cover"
        />
        <LoveButton product={item} />
      </View>

      {item.images.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 py-3">
          {item.images.map((image, index) => (
            <Pressable key={image} onPress={() => setPhoto(index)} className="mr-2">
              <Image
                source={{ uri: image }}
                className={`w-16 h-16 rounded-xl bg-navy ${photo === index ? 'border-2 border-glow' : ''}`}
              />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View className="px-4 pt-2">
        {item.category ? (
          <Pressable onPress={() => router.push(`/(customer)/browse?category=${item.category}`)}>
            <Text className="text-mute text-xs tracking-widest uppercase">{item.category}</Text>
          </Pressable>
        ) : null}
        <Text className="text-3xl font-semibold text-ice mt-1">{item.name}</Text>
        {item.vendor ? (
          <Pressable onPress={() => router.push(`/(customer)/vendor/${item.vendor!.slug}`)}>
            <Text className="text-glow mt-2">Visit {item.vendor.storeName}</Text>
          </Pressable>
        ) : null}
        {item.rating ? (
          <View className="flex-row items-center mt-2">
            <Stars value={item.rating} />
            <Text className="text-mute ml-2">{item.reviewCount ?? reviews.length} reviews</Text>
          </View>
        ) : null}
        <View className="mt-5">
          <Text className="text-2xl font-semibold text-glow">{formatMoney(item.price)}</Text>
          {item.comparePrice ? (
            <Text className="text-sm text-mute line-through">{formatMoney(item.comparePrice)}</Text>
          ) : null}
        </View>
        <View className="mt-4">
          <ShopPromises />
        </View>
        <Text className="text-mute mt-6 leading-6">{item.description}</Text>
        {item.styleNotes ? <Text className="text-mute mt-3">{item.styleNotes}</Text> : null}
        {item.fromShop ? <Text className="text-mute mt-2">{item.fromShop}</Text> : null}

        {item.options?.map((option) => (
          <View key={option.name} className="mt-5">
            <Text className="text-ice font-semibold mb-2">{option.name}</Text>
            <View className="flex-row flex-wrap">
              {option.values.map((value) => {
                const active = picks[option.name] === value
                return (
                  <Pressable
                    key={value}
                    onPress={() => setPicks((current) => ({ ...current, [option.name]: value }))}
                    className={`mr-2 mb-2 px-3 py-2 rounded-full ${active ? 'bg-brand' : 'bg-panel'}`}
                  >
                    <Text className={active ? 'text-white font-semibold' : 'text-mute'}>{value}</Text>
                  </Pressable>
                )
              })}
            </View>
          </View>
        ))}

        {item.specs?.length ? (
          <View className="mt-6 bg-panel rounded-2xl p-4">
            <Text className="text-ice font-bold mb-2">Details</Text>
            {item.specs.map((spec) => (
              <View key={spec.label} className="flex-row justify-between py-1">
                <Text className="text-mute">{spec.label}</Text>
                <Text className="text-ice">{spec.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-ice font-semibold">Quantity</Text>
          <View className="flex-row items-center">
            <Pressable
              className="w-9 h-9 rounded-full bg-panel items-center justify-center"
              onPress={() => setQuantity((value) => Math.max(1, value - 1))}
            >
              <Text className="text-ice text-lg">−</Text>
            </Pressable>
            <Text className="w-10 text-center text-ice">{quantity}</Text>
            <Pressable
              className="w-9 h-9 rounded-full bg-panel items-center justify-center"
              onPress={() => setQuantity((value) => Math.min(8, value + 1))}
            >
              <Text className="text-ice text-lg">+</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          className={`mt-6 py-4 rounded-2xl ${already ? 'bg-navy' : 'bg-signal'}`}
          onPress={() => addToBag(false)}
          accessibilityRole="button"
          accessibilityLabel={already ? `Add another ${item.name}` : `Add ${item.name} to bag`}
        >
          <Text className="text-white text-center font-bold text-lg">{already ? 'Add another' : 'Add to bag'}</Text>
        </Pressable>
        <Pressable
          className="mt-3 py-4 rounded-2xl border border-ice/15"
          onPress={() => addToBag(true)}
          accessibilityRole="button"
          accessibilityLabel={`Buy ${item.name} now`}
        >
          <Text className="text-ice text-center font-bold text-lg">Buy now</Text>
        </Pressable>
      </View>

      {reviews.length ? (
        <View className="px-4 mt-8">
          <Text className="text-xl font-bold text-ice mb-3">Reviews</Text>
          {reviews.slice(0, 5).map((review) => (
            <View key={review.id} className="bg-panel rounded-2xl p-4 mb-2">
              <View className="flex-row justify-between">
                <Text className="text-ice font-semibold">{review.author}</Text>
                <Stars value={review.rating} />
              </View>
              {review.title ? <Text className="text-ice mt-1">{review.title}</Text> : null}
              <Text className="text-mute mt-1">{review.content}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <ProductRail
        title="You might also like"
        products={relatedItems}
        onSeeAll={item.category ? () => router.push(`/(customer)/browse?category=${item.category}`) : undefined}
      />
    </ScrollView>
  )
}
