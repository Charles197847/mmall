import { useEffect } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useCartStore } from '../../../stores/cartStore'
import { clearPendingCheckout } from '../../../lib/pendingCheckout'

export default function PaymentReturnScreen() {
  const params = useLocalSearchParams<{ TRANSACTION_STATUS?: string; PAY_REQUEST_ID?: string }>()
  const clearCart = useCartStore((s) => s.clearCart)
  const status = Array.isArray(params.TRANSACTION_STATUS) ? params.TRANSACTION_STATUS[0] : params.TRANSACTION_STATUS
  const payRequestId = Array.isArray(params.PAY_REQUEST_ID) ? params.PAY_REQUEST_ID[0] : params.PAY_REQUEST_ID
  const approved = status === '1'

  useEffect(() => {
    if (!status) return
    if (!approved) {
      clearPendingCheckout()
      return
    }
    clearCart()
    clearPendingCheckout()
  }, [approved, clearCart, status])

  return (
    <View className="flex-1 bg-void p-6 justify-center">
      <Text className="text-xs tracking-[0.2em] text-mute mb-2">PAYGATE PAYWEB 3 · DEMO PAYMENT</Text>
      <Text className="text-3xl font-bold text-ice mb-3">{approved ? 'Mock payment approved' : 'Mock payment not completed'}</Text>
      <Text className="text-mute mb-8">
        {approved
          ? 'PayGate authorised the mock transaction. No live card was charged. The vendor can now book The Courier Guy for collection.'
          : 'The mock PayGate session was declined or cancelled. Your bag is still here — retry from checkout.'}
      </Text>
      {payRequestId ? (
        <Text className="text-xs text-mute mb-6">PAY_REQUEST_ID {payRequestId}</Text>
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
