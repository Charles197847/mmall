import { Redirect, useLocalSearchParams } from 'expo-router'

export default function VendorStoreRedirect() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  return <Redirect href={`/(customer)/vendor/${slug}`} />
}
