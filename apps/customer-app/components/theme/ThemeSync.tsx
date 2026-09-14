import { useEffect } from 'react'
import { colorScheme } from 'nativewind'
import { useThemeStore } from '../../stores/themeStore'

export function ThemeSync() {
  const mode = useThemeStore((state) => state.mode)

  useEffect(() => {
    colorScheme.set(mode)
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('light', mode === 'light')
    document.documentElement.classList.toggle('dark', mode === 'dark')
    window.localStorage.setItem('mmall-color-mode', mode)
  }, [mode])

  return null
}
