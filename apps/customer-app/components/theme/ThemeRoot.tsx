import type { ReactNode } from 'react'
import { View } from 'react-native'
import { palettes, themeVars } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

export function ThemeRoot({ children }: { children: ReactNode }) {
  const mode = useThemeStore((state) => state.mode)
  return (
    <View style={[{ flex: 1, backgroundColor: palettes[mode].void }, themeVars[mode]]}>
      {children}
    </View>
  )
}
