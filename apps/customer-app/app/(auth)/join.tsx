import { Pressable, Text, View } from 'react-native'
import { Link, router } from 'expo-router'
import { Screen } from '../../components/ui/Screen'
import { BrandMark } from '../../components/brand/BrandMark'

export default function JoinScreen() {
  return (
    <Screen className="flex-1">
      <View className="flex-1 p-6 pt-8">
        <BrandMark />
        <Text className="text-ice mt-8" style={{ fontSize: 32, fontWeight: '300' }}>
          Join MMall
        </Text>
        <Text className="text-mute mt-2">
          Shoppers and merchants are different accounts. Pick one path — you can add the other later with a different
          email.
        </Text>

        <Pressable
          className="mt-8 rounded-3xl bg-panel p-6"
          onPress={() => router.push('/(auth)/register')}
        >
          <Text className="text-xs text-mute">General user</Text>
          <Text className="text-ice text-2xl mt-2" style={{ fontWeight: '300' }}>
            I want to shop
          </Text>
          <Text className="text-mute text-sm mt-3">
            One basket across the mall. Orders, gift cards, vouchers, and Deliver to. No store, no KYC.
          </Text>
          <Text className="text-ice font-semibold mt-6">Create a shopper account</Text>
        </Pressable>

        <Pressable className="mt-4 rounded-3xl bg-panel p-6" onPress={() => router.push('/(auth)/sell')}>
          <Text className="text-xs text-mute">Vendor</Text>
          <Text className="text-ice text-2xl mt-2" style={{ fontWeight: '300' }}>
            I want to sell
          </Text>
          <Text className="text-mute text-sm mt-3">
            Your own shop on the mall. Phone OTP, then the vendor desk for products, orders, and ads.
          </Text>
          <Text className="text-ice font-semibold mt-6">Create a store</Text>
        </Pressable>

        <Text className="text-mute text-sm mt-8">
          Already have an account?{' '}
          <Link href="/(auth)/login">
            <Text className="text-ice font-semibold">Shopper sign in</Text>
          </Link>
          {' · '}
          <Link href="/(auth)/vendor-login">
            <Text className="text-ice font-semibold">Merchant sign in</Text>
          </Link>
        </Text>
      </View>
    </Screen>
  )
}
