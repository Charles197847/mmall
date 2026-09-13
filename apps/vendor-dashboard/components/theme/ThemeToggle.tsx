'use client'

import { useThemeStore } from '../../stores/themeStore'

export function ThemeToggle({ variant = 'label' }: { variant?: 'label' | 'icon' }) {
  const mode = useThemeStore((state) => state.mode)
  const toggle = useThemeStore((state) => state.toggle)
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--mm-card-border)] text-ice hover:bg-black/10"
      >
        {mode === 'dark' ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v1.6M12 19.4V21M4.6 4.6l1.1 1.1M18.3 18.3l1.1 1.1M3 12h1.6M19.4 12H21M4.6 19.4l1.1-1.1M18.3 5.7l1.1-1.1" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M14.6 3.1a8.4 8.4 0 1 0 6.3 13.2A7 7 0 0 1 14.6 3.1z" />
          </svg>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="rounded-full bg-panel px-3 py-1.5 text-xs font-semibold tracking-wide text-ice"
    >
      {mode === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}
