import { Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useThemeStore } from '../../stores/themeStore'
import { palettes } from '../../lib/theme'

export function ThemeToggle({ variant = 'default' }: { variant?: 'default' | 'hero' | 'chrome' }) {
  const mode = useThemeStore((state) => state.mode)
  const toggle = useThemeStore((state) => state.toggle)
  const colors = palettes[mode]
  const hero = variant === 'hero'
  const chrome = variant === 'chrome'

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      accessibilityState={{ checked: mode === 'dark' }}
      className={
        hero
          ? 'w-10 h-10 rounded-full border border-white/25 bg-white/10 items-center justify-center'
          : chrome
            ? 'w-10 h-10 items-center justify-center'
            : 'w-11 h-11 rounded-full bg-panel items-center justify-center'
      }
    >
      <Feather
        name={mode === 'dark' ? 'sun' : 'moon'}
        size={18}
        color={hero ? '#FFFFFF' : chrome ? colors.ice : colors.glow}
      />
    </Pressable>
  )
}
