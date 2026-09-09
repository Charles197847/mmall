import { config as defaultConfig } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const config = createTamagui(defaultConfig)

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
