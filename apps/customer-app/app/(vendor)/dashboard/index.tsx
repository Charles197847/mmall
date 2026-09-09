import { Text, View } from 'react-native'
import { Link } from 'expo-router'

export default function VendorDashboardScreen() {
  return (
    <View className="flex-1 p-6 bg-void">
      <Text className="text-2xl font-bold mb-2 text-ice">Vendor tools</Text>
      <Text className="text-mute mb-4">
        Full catalog, payouts, and analytics live in the MMall vendor dashboard.
      </Text>
      <Link href="/(customer)/browse">
        <Text className="text-glow">Back to shopping</Text>
      </Link>
    </View>
  )
}
