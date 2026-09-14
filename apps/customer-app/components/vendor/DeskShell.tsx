import { Pressable, ScrollView, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { router, usePathname } from 'expo-router'
import { useAuth } from '../../lib/auth/AuthProvider'
import { ThemeToggle } from '../theme/ThemeToggle'

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

  return (
    <ScrollView className="flex-1 bg-void" contentContainerClassName="pb-16 pt-14 px-5">
      <View className="flex-row items-center justify-between mb-4">
        <View>
          <Text className="text-xs text-mute">{kicker}</Text>
          <Text className="text-ice mt-1" style={{ fontSize: 30, fontWeight: '300' }}>
            {title}
          </Text>
        </View>
        <ThemeToggle />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6" contentContainerClassName="gap-2">
        {links.map((item) => {
          const active =
            item.match === 'dashboard'
              ? path.endsWith('/dashboard') || path.endsWith('/dashboard/')
              : path.includes(item.match)
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              className={`rounded-full px-3 py-1.5 ${active ? 'bg-brand' : 'bg-panel'}`}
            >
              <Text className={`text-xs ${active ? 'text-white' : 'text-ice'}`}>{item.label}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
      {children}
      <Pressable className="mt-10" onPress={() => router.push('/(customer)')}>
        <Text className="text-ice">Continue shopping</Text>
      </Pressable>
      <Pressable className="mt-4" onPress={() => void logout().then(() => router.replace('/(auth)/vendor-login' as never))}>
        <Text className="text-mute">{user?.email ?? 'Sign out'}</Text>
      </Pressable>
    </ScrollView>
  )
}
