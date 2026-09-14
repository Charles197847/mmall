import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth/AuthProvider'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import { useSavedStore } from '../../stores/savedStore'
import { useCartStore } from '../../stores/cartStore'
import { BrandMark } from '../brand/BrandMark'
import { ThemeToggle } from '../theme/ThemeToggle'
import { DeliverTo } from './DeliverTo'
import { ShopPromises } from './ShopPromises'

function Badge({ count }: { count: number }) {
  if (count < 1) return null
  return (
    <View className="absolute -right-1.5 -top-1 min-w-[18px] h-[18px] px-1 rounded-full bg-signal items-center justify-center">
      <Text className="text-white text-[10px] font-bold">{count > 99 ? '99+' : count}</Text>
    </View>
  )
}

export function MallChrome() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const loved = useSavedStore((state) => state.items.length)
  const bag = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const [query, setQuery] = useState('')
  const border = mode === 'dark' ? 'rgba(232,238,252,0.12)' : 'rgba(11,23,54,0.1)'

  function search() {
    const needle = query.trim()
    router.push(
      needle
        ? (`/(customer)/browse?q=${encodeURIComponent(needle)}` as never)
        : ('/(customer)/browse' as never),
    )
  }

  return (
    <View
      className="bg-navy/95 border-b"
      style={{ paddingTop: insets.top + 6, borderBottomColor: border }}
    >
      <View className="px-4 pb-3">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.push('/(customer)')} className="mr-3">
            <BrandMark compact />
          </Pressable>
          <View className="flex-1 mr-2">
            <DeliverTo />
          </View>
          <Pressable
            onPress={() => router.push('/(customer)/saved')}
            className="relative p-1 mr-1"
            accessibilityLabel={`Loved items, ${loved}`}
          >
            <Feather name="heart" size={22} color={colors.ice} />
            <Badge count={loved} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(customer)/cart')}
            className="relative p-1 mr-1"
            accessibilityLabel={`Basket, ${bag} items`}
          >
            <Feather name="shopping-bag" size={22} color={colors.ice} />
            <Badge count={bag} />
          </Pressable>
          <ThemeToggle />
          {user ? (
            <Pressable
              onPress={() => router.push('/(customer)/profile')}
              className="ml-2 h-9 px-3 rounded-full bg-brand items-center justify-center"
            >
              <Text className="text-white text-xs font-semibold">{user.firstName}</Text>
            </Pressable>
          ) : (
            <View className="flex-row items-center ml-1">
              <Pressable onPress={() => router.push('/(auth)/join' as never)} className="px-2">
                <Text className="text-ice text-xs">Join</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push('/(auth)/login' as never)}
                className="h-9 px-3 rounded-full bg-brand items-center justify-center"
              >
                <Text className="text-white text-xs font-semibold">Sign in</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="mt-3 rounded-full bg-void px-4 py-2">
          <Text className="text-[10px] tracking-wide text-mute">Search the mall</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="A court, a shop, a drop"
            placeholderTextColor={colors.mute}
            className="text-ice py-0.5"
            style={{ fontSize: 16, fontWeight: '300' }}
            returnKeyType="search"
            onSubmitEditing={search}
          />
        </View>

        <View className="mt-3">
          <ShopPromises />
        </View>
      </View>
    </View>
  )
}
