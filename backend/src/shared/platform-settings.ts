import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { PlatformSettings } from '@shopping-mall/shared-types'
import { defaultCategoryCommissions, defaultPlatformSettings } from './fees.js'

export type { PlatformSettings }

const settingsFile = join(process.cwd(), 'data', 'platform-settings.json')

export function readPlatformSettings(): PlatformSettings {
  try {
    const raw = JSON.parse(readFileSync(settingsFile, 'utf8')) as Partial<PlatformSettings>
    return {
      ...defaultPlatformSettings,
      ...raw,
      categoryCommissions: raw.categoryCommissions?.length
        ? raw.categoryCommissions
        : defaultCategoryCommissions,
    }
  } catch {
    return { ...defaultPlatformSettings, categoryCommissions: defaultCategoryCommissions }
  }
}

export function writePlatformSettings(next: PlatformSettings): PlatformSettings {
  const merged: PlatformSettings = {
    ...defaultPlatformSettings,
    ...next,
    categoryCommissions: next.categoryCommissions?.length
      ? next.categoryCommissions
      : defaultCategoryCommissions,
  }
  mkdirSync(dirname(settingsFile), { recursive: true })
  writeFileSync(settingsFile, JSON.stringify(merged, null, 2))
  return merged
}
