import { Pressable, ScrollView, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { router, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../lib/auth/AuthProvider'
import { ThemeToggle } from '../theme/ThemeToggle'
import { layout } from '../../lib/layout'

const links = [
  { href: '/(vendor)/dashboard', label: 'Overview', match: 'dashboard' },
  { href: '/(vendor)/dashboard/products', label: 'Products', match: 'products' },
  { href: '/(vendor)/dashboard/orders', label: 'Orders', match: 'orders' },
  { href: '/(vendor)/dashboard/studio', label: 'AI Studio', match: 'studio' },
  { href: '/(vendor)/dashboard/advertise', label: 'Advertise', match: 'advertise' },
  { href: '/(vendor)/dashboard/settings', label: 'Store settings', match: 'settings' },
  { href: '/(vendor)/dashboard/fees', label: 'Pricing & fees', match: 'fees' },
  { href: '/(vendor)/dashboard/verify', label: 'Verify account', match: 'verify' },
] as const

export function DeskShell({
  title,
  kicker = 'Vendor desk',
  children,
}: {
  title: string
  kicker?: string
  children: ReactNode
}) {
  const path = usePathname() ?? ''
  const { user, logout } = useAuth()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      className="flex-1 bg-void"
      contentContainerStyle={{ paddingBottom: 32, paddingTop: insets.top + 12, paddingHorizontal: layout.pageX }}
    >
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1 pr-3">
          <Text className="text-xs text-mute">{kicker}</Text>
          <Text className="text-ice mt-1" style={{ fontSize: layout.title, lineHeight: layout.titleLine, fontWeight: '300' }}>
            {title}
          </Text>
        </View>
        <ThemeToggle />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-5"
        contentContainerStyle={{ gap: 8, paddingRight: 8 }}
      >
        {links.map((item) => {
          const active =
            item.match === 'dashboard'
              ? path.endsWith('/dashboard') || path.endsWith('/dashboard/')
              : path.includes(item.match)
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              className={`rounded-full px-3.5 ${active ? 'bg-brand' : 'bg-panel'}`}
              style={{ minHeight: layout.chip, justifyContent: 'center' }}
            >
              <Text className={`text-sm ${active ? 'text-white' : 'text-ice'}`}>{item.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
      {children}
      <Pressable className="mt-8" style={{ minHeight: layout.chip, justifyContent: 'center' }} onPress={() => router.push('/(customer)')}>
        <Text className="text-ice">Continue shopping</Text>
      </Pressable>
      <Pressable
        className="mt-2"
        style={{ minHeight: layout.chip, justifyContent: 'center' }}
        onPress={() => void logout().then(() => router.replace('/(auth)/vendor-login' as never))}
      >
        <Text className="text-mute">{user?.email ?? 'Sign out'}</Text>
      </Pressable>
    </ScrollView>
  )
}
