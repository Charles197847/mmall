import { useEffect } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useCartStore } from '../../../stores/cartStore'

export default function PaymentReturnScreen() {
  const params = useLocalSearchParams<{ TRANSACTION_STATUS?: string; PAY_REQUEST_ID?: string }>()
  const clearCart = useCartStore((s) => s.clearCart)
  const approved = params.TRANSACTION_STATUS === '1'

  useEffect(() => {
    if (approved) clearCart()
  }, [approved, clearCart])

  return (
    <View className="flex-1 bg-void p-6 justify-center">
      <Text className="text-xs tracking-[0.2em] text-mute mb-2">PAYGATE PAYWEB</Text>
      <Text className="text-3xl font-bold text-ice mb-3">{approved ? 'Payment approved' : 'Payment not completed'}</Text>
      <Text className="text-mute mb-8">
        {approved
          ? 'PayGate authorised the mock transaction. The vendor can now book The Courier Guy for collection.'
          : 'The mock PayGate session was declined or cancelled. You can retry from checkout.'}
      </Text>
      {params.PAY_REQUEST_ID ? (
        <Text className="text-xs text-mute mb-6">PAY_REQUEST_ID {params.PAY_REQUEST_ID}</Text>
      ) : (
        <ActivityIndicator color="#3DE8FF" />
      )}
      <TouchableOpacity
        className="bg-brand py-3 rounded-2xl mb-3"
        onPress={() => router.replace(approved ? '/(customer)/orders' : '/(customer)/cart/checkout')}
      >
        <Text className="text-white text-center font-semibold">{approved ? 'View orders' : 'Back to checkout'}</Text>
      </TouchableOpacity>
    </View>
  )
}
