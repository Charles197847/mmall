'use client'

import { useEffect } from 'react'
import { useThemeStore } from '../../stores/themeStore'

export function ThemeSync() {
  const mode = useThemeStore((state) => state.mode)

  useEffect(() => {
    document.documentElement.classList.toggle('light', mode === 'light')
    document.documentElement.classList.toggle('dark', mode === 'dark')
    window.localStorage.setItem('mmall-color-mode', mode)
  }, [mode])

  return null
}
