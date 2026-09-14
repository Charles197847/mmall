import { vars } from 'nativewind'

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
    void: '#F1F2F4',
    navy: '#FFFFFF',
    panel: '#FFFFFF',
    ice: '#0B1736',
    mute: '#5C6472',
    brand: '#2F6BFF',
    signal: '#E11D48',
    glow: '#1557E0',
  },
} as const

export type ThemeMode = keyof typeof palettes

export const themeVars = {
  light: vars({
    '--mm-void': '241 242 244',
    '--mm-navy': '255 255 255',
    '--mm-panel': '255 255 255',
    '--mm-glass': '232 234 238',
    '--mm-ice': '11 23 54',
    '--mm-mute': '92 100 114',
    '--mm-brand': '47 107 255',
    '--mm-signal': '225 29 72',
    '--mm-glow': '21 87 224',
  }),
  dark: vars({
    '--mm-void': '5 8 20',
    '--mm-navy': '11 23 54',
    '--mm-panel': '18 32 68',
    '--mm-glass': '22 38 80',
    '--mm-ice': '232 238 252',
    '--mm-mute': '139 160 201',
    '--mm-brand': '47 107 255',
    '--mm-signal': '255 45 74',
    '--mm-glow': '61 232 255',
  }),
}

/** Default tokens for non-reactive callers. Prefer `palettes[mode]`. */
export const mmall = palettes.light

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

export const stackHeader = headerOptions('light')
