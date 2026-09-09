import { Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeStore } from '../../stores/themeStore'
import { palettes } from '../../lib/theme'

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode)
  const toggle = useThemeStore((state) => state.toggle)
  const colors = palettes[mode]

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-11 h-11 rounded-full bg-panel items-center justify-center"
    >
      <Feather name={mode === 'dark' ? 'sun' : 'moon'} size={18} color={colors.glow} />
    </Pressable>
  )
}
