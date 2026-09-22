import { useState, type ReactNode } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { router } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth/AuthProvider'
import { layout } from '../../lib/layout'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import { useSavedStore } from '../../stores/savedStore'
import { useCartStore } from '../../stores/cartStore'
import { BrandMark } from '../brand/BrandMark'
import { ThemeToggle } from '../theme/ThemeToggle'
import { DeliverTo } from './DeliverTo'

function Badge({ count }: { count: number }) {
  if (count < 1) return null
  return (
    <View className="absolute right-0.5 top-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-signal items-center justify-center">
      <Text className="text-white text-[10px] font-bold">{count > 99 ? '99+' : count}</Text>
    </View>
  )
}

function IconHit({
  label,
  onPress,
  children,
}: {
  label: string
  onPress: () => void
  children: ReactNode
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      hitSlop={4}
      className="relative items-center justify-center"
      style={{ width: layout.icon, height: layout.icon }}
    >
      {children}
    </Pressable>
  )
}

export function MallChrome({ showSearch = true }: { showSearch?: boolean }) {
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
      style={{ paddingTop: insets.top + 4, borderBottomColor: border }}
    >
      <View className="px-4 pb-2.5">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.push('/(customer)')} className="shrink-0 mr-2" hitSlop={6}>
            <BrandMark compact />
          </Pressable>
          <View className="flex-1" />
          <IconHit label={`Loved items, ${loved}`} onPress={() => router.push('/(customer)/saved')}>
            <Feather name="heart" size={22} color={colors.ice} />
            <Badge count={loved} />
          </IconHit>
          <IconHit label={`Basket, ${bag} items`} onPress={() => router.push('/(customer)/cart')}>
            <Feather name="shopping-bag" size={22} color={colors.ice} />
            <Badge count={bag} />
          </IconHit>
          <ThemeToggle variant="chrome" />
          {user ? (
            <Pressable
              onPress={() => router.push('/(customer)/profile')}
              accessibilityLabel={`Account, ${user.firstName}`}
              className="ml-0.5 rounded-full bg-brand items-center justify-center"
              style={{ width: layout.icon, height: layout.icon }}
            >
              <Text className="text-white text-sm font-semibold">
                {(user.firstName || 'A').slice(0, 1).toUpperCase()}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => router.push('/(auth)/join' as never)}
              accessibilityLabel="Join or sign in"
              className="ml-0.5 rounded-full bg-black/20 items-center justify-center"
              style={{ width: layout.icon, height: layout.icon }}
            >
              <Feather name="user" size={18} color={colors.ice} />
            </Pressable>
          )}
        </View>

        {showSearch ? (
          <View className="mt-2.5 flex-row items-center">
            <View className="mr-2.5 max-w-[42%] shrink-0">
              <DeliverTo tone="chrome" />
            </View>
            <View
              className="flex-1 flex-row items-center rounded-full bg-void px-3"
              style={{ minHeight: layout.chip, minWidth: 0 }}
            >
              <Feather name="search" size={16} color={colors.mute} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search the mall"
                placeholderTextColor={colors.mute}
                className="flex-1 text-ice ml-2 py-0"
                style={{ fontSize: 16, fontWeight: '400', minWidth: 0, flex: 1 }}
                returnKeyType="search"
                onSubmitEditing={search}
              />
            </View>
          </View>
        ) : (
          <View className="mt-2">
            <DeliverTo tone="chrome" />
          </View>
        )}
      </View>
    </View>
  )
}
