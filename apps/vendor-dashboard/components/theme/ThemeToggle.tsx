'use client'

import { useThemeStore } from '../../stores/themeStore'

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode)
  const toggle = useThemeStore((state) => state.toggle)

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full bg-panel px-3 py-1.5 text-xs font-semibold tracking-wide text-ice"
    >
      {mode === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}
