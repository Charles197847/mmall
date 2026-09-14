import { Pressable, Text, View } from 'react-native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { formatMoney } from '@shopping-mall/shared-types'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { DeskShell } from '../../../components/vendor/DeskShell'
import { KycActionNotice, KycBanner } from '../../../components/vendor/KycBanner'

export default function VendorFeesScreen() {
  const { token } = useAuth()
  const me = useQuery({ queryKey: ['vendor-me', token], queryFn: () => api.auth.me(token!), enabled: Boolean(token) })
  const kyc = useQuery({ queryKey: ['vendor-kyc', token], queryFn: () => api.kyc.me(token!), enabled: Boolean(token) })
  const pricing = useQuery({ queryKey: ['vendor-pricing', token], queryFn: () => api.vendors.pricing(token!), enabled: Boolean(token) })
  const payouts = useMutation({ mutationFn: () => api.payments.registerPayout(token!) })
  const vendor = me.data?.vendor
  const data = pricing.data
  const fashionNet = data ? 1000 - 1000 * 0.15 - (1000 * (data.gatewayPercent / 100) + data.gatewayFixed) : 0

  return (
    <DeskShell title="Pricing & fees">
      <KycBanner kyc={kyc.data} />
      <View className="bg-panel rounded-2xl p-4 mb-4">
        <Text className="text-ice font-semibold">Bank payouts</Text>
        <Text className="text-mute text-sm mt-2">
          Payouts need Enterprise verification. MMall then settles vendors with PayGate PayBatch EFT.
        </Text>
        {vendor?.paygateBeneficiaryId || payouts.isSuccess ? (
          <Text className="text-glow mt-3">PayBatch beneficiary registered.</Text>
        ) : (
          <Pressable className="mt-4 rounded-full bg-brand py-3" onPress={() => payouts.mutate()} disabled={payouts.isPending}>
            <Text className="text-white text-center font-semibold">
              {payouts.isPending ? 'Registering PayBatch…' : 'Register PayGate payout account'}
            </Text>
          </Pressable>
        )}
        {payouts.isError ? <KycActionNotice error={payouts.error} /> : null}
      </View>
      {data ? (
        <>
          <View className="bg-panel rounded-2xl p-4 mb-4">
            <Text className="text-ice font-semibold">Store subscription</Text>
            <Text className="text-ice text-3xl font-bold mt-2">{formatMoney(data.monthlyPlatformFee, data.currency)} / month</Text>
          </View>
          <View className="bg-panel rounded-2xl p-4 mb-4">
            <Text className="text-ice font-semibold mb-3">Category commissions</Text>
            {data.categoryCommissions.map((band) => (
              <View key={band.id} className="flex-row justify-between py-2 border-b border-ice/10">
                <View className="flex-1 pr-3">
                  <Text className="text-ice">{band.label}</Text>
                  <Text className="text-mute text-xs">{band.examples}</Text>
                </View>
                <Text className="text-ice">{band.rate}%</Text>
              </View>
            ))}
          </View>
          <View className="bg-panel rounded-2xl p-4 mb-4">
            <Text className="text-ice font-semibold">Payment processing</Text>
            <Text className="text-mute text-sm mt-2">
              Gateway {data.gatewayPercent}% + {formatMoney(data.gatewayFixed, data.currency)}. Withdrawal {formatMoney(data.withdrawalFee, data.currency)}. Min payout {formatMoney(data.minPayoutAmount, data.currency)}.
            </Text>
          </View>
          <View className="bg-panel rounded-2xl p-4">
            <Text className="text-ice font-semibold">Example: R1,000 Fashion sale</Text>
            <Text className="text-mute text-sm mt-2">Net credited: {formatMoney(fashionNet, data.currency)}</Text>
          </View>
        </>
      ) : (
        <Text className="text-mute">Loading fee structure…</Text>
      )}
    </DeskShell>
  )
}
