import { Pressable, Text, View } from 'react-native'
import { router } from 'expo-router'
import type { VendorKyc } from '@shopping-mall/shared-types'

const labels = {
  EXPLORER: 'Explorer',
  ACTIVE_VENDOR: 'Active Vendor',
  ENTERPRISE: 'Verified Merchant',
} as const

export function KycBanner({ kyc }: { kyc: VendorKyc | null | undefined }) {
  if (!kyc) return null

  if (kyc.status === 'APPROVED' && kyc.approvedTier === 'ENTERPRISE') {
    return (
      <View className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <Text className="text-ice text-sm">Verified Merchant — ads, paid AI, and payouts are unlocked.</Text>
      </View>
    )
  }

  if (kyc.status === 'APPROVED' && kyc.approvedTier === 'ACTIVE_VENDOR') {
    return (
      <View className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <Text className="text-ice text-sm">
          Active Vendor — live listings, ads, and paid AI are unlocked. Business verification is still required for payouts.
        </Text>
        <Pressable className="mt-2" onPress={() => router.push('/(vendor)/dashboard/verify' as never)}>
          <Text className="text-glow font-semibold">Unlock payouts</Text>
        </Pressable>
      </View>
    )
  }

  if (kyc.status === 'PENDING') {
    return (
      <View className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
        <Text className="text-ice text-sm">Verification pending — usually approved within {kyc.reviewEtaMinutes} minutes.</Text>
      </View>
    )
  }

  if (kyc.status === 'REJECTED') {
    return (
      <View className="mb-6 rounded-2xl border border-signal/40 bg-signal/10 px-4 py-3">
        <Text className="text-ice text-sm">{kyc.rejectionReason || 'Please re-upload a clearer SA ID.'}</Text>
        <Pressable className="mt-2" onPress={() => router.push('/(vendor)/dashboard/verify' as never)}>
          <Text className="text-glow font-semibold">Fix documents</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="mb-6 rounded-2xl bg-panel px-4 py-3">
      <Text className="text-ice text-sm">
        You are on {labels[kyc.approvedTier]}. Verify to go live, buy ads, or take payouts.
      </Text>
      <Pressable className="mt-3 rounded-full bg-brand py-2" onPress={() => router.push('/(vendor)/dashboard/verify' as never)}>
        <Text className="text-white text-center font-semibold">Verify account</Text>
      </Pressable>
    </View>
  )
}

export function KycActionNotice({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'That action needs a higher verification tier.'
  return (
    <View className="mb-4 rounded-2xl bg-signal/10 px-4 py-3">
      <Text className="text-ice text-sm">{message}</Text>
    </View>
  )
}
