import { Stack } from 'expo-router'
import { headerOptions } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

export default function VendorGroupLayout() {
  const mode = useThemeStore((state) => state.mode)
  return <Stack screenOptions={headerOptions(mode)} />
}
