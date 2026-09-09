export const palettes = {
  dark: {
    void: '#050814',
    navy: '#0B1736',
    panel: '#122044',
    ice: '#E8EEFC',
    mute: '#8BA0C9',
    brand: '#2F6BFF',
    signal: '#FF2D4A',
    glow: '#3DE8FF',
  },
  light: {
    void: '#F3F6FF',
    navy: '#FFFFFF',
    panel: '#FFFFFF',
    ice: '#0B1736',
    mute: '#5A6B8C',
    brand: '#2F6BFF',
    signal: '#E11D48',
    glow: '#1557E0',
  },
} as const

export type ThemeMode = keyof typeof palettes

/** Default (dark) tokens for non-reactive callers. Prefer `useThemeColors`. */
export const mmall = palettes.dark

export function headerOptions(mode: ThemeMode) {
  const colors = palettes[mode]
  return {
    headerStyle: {
      backgroundColor: colors.navy,
      borderBottomWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
      shadowColor: 'transparent',
    },
    headerTintColor: colors.ice,
    headerTitleStyle: { fontWeight: '700' as const },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: colors.void },
  }
}

export const stackHeader = headerOptions('dark')
