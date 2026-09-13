import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useCartStore } from '../../stores/cartStore'
import { headerOptions, palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

export default function CustomerLayout() {
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        ...headerOptions(mode),
        tabBarActiveTintColor: colors.glow,
        tabBarInactiveTintColor: colors.mute,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: colors.glow,
          shadowOpacity: 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -6 },
          paddingBottom: 6,
          paddingTop: 6,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse/index"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stores/index"
        options={{
          title: 'Stores',
          tabBarIcon: ({ color, size }) => <Feather name="layers" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          headerShown: false,
          tabBarAccessibilityLabel: cartCount ? `Cart, ${cartCount} items` : 'Cart',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Feather name="shopping-bag" size={size} color={color} />
              {cartCount > 0 ? (
                <View className="absolute -top-1 -right-2 bg-signal rounded-full min-w-4 h-4 px-1 items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{cartCount}</Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="package" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} />,
        }}
      />
      <Tabs.Screen name="product/[id]" options={{ href: null, title: 'Product' }} />
      <Tabs.Screen name="vendor/[slug]" options={{ href: null, title: 'Store' }} />
    </Tabs>
  )
}
