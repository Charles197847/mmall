import { Tabs } from 'expo-router'
import { Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useCartStore } from '../../stores/cartStore'
import { headerOptions, palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import { AdPopup } from '../../components/mall/AdPopup'
import { LocationSync } from '../../components/mall/LocationSync'

export default function CustomerLayout() {
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0))
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]

  return (
    <View className="flex-1">
      <LocationSync />
      <AdPopup />
      <Tabs
      screenOptions={{
        headerShown: true,
        ...headerOptions(mode),
        tabBarActiveTintColor: colors.ice,
        tabBarInactiveTintColor: colors.mute,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopWidth: 1,
          borderTopColor: mode === 'light' ? '#E6E7EA' : '#1A2748',
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 8,
          paddingTop: 8,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '400' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mall',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse/index"
        options={{
          title: 'Courts',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Feather name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stores/index"
        options={{
          title: 'Shops',
          headerShown: false,
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
      <Tabs.Screen name="product/[id]" options={{ href: null, headerShown: false, title: 'Product' }} />
      <Tabs.Screen name="vendor/[slug]" options={{ href: null, headerShown: false, title: 'Store' }} />
      <Tabs.Screen name="saved/index" options={{ href: null, headerShown: false, title: 'Saved' }} />
      <Tabs.Screen name="help/index" options={{ href: null, headerShown: false, title: 'Customer service' }} />
      <Tabs.Screen name="specials/index" options={{ href: null, headerShown: false, title: "Today's specials" }} />
      <Tabs.Screen name="bestsellers/index" options={{ href: null, headerShown: false, title: 'Best sellers' }} />
      <Tabs.Screen name="vouchers/index" options={{ href: null, headerShown: false, title: 'Promotional vouchers' }} />
      <Tabs.Screen name="gift-cards/index" options={{ href: null, headerShown: false, title: 'Gift cards' }} />
      <Tabs.Screen name="gift-cards/claim" options={{ href: null, headerShown: false, title: 'Claim gift card' }} />
    </Tabs>
    </View>
  )
}
