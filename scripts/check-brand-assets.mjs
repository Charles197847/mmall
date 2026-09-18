#!/usr/bin/env node
/**
 * Asserts every brand PNG referenced by Expo BrandMark/app.json and Next /shop
 * exists on disk with a PNG signature. Search tools often skip binaries, which
 * produced false MM-QA-001 / MM-QA-003 misses.
 */
import { readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

const required = [
  // MM-QA-001 — Expo customer-app
  'apps/customer-app/assets/mmall-bag.png',
  'apps/customer-app/assets/mmall-wordmark.png',
  'apps/customer-app/assets/mmall-web-banner.png',
  'apps/customer-app/assets/icon.png',
  'apps/customer-app/assets/splash.png',
  'apps/customer-app/assets/adaptive-icon.png',
  'apps/customer-app/assets/favicon.png',
  'apps/customer-app/assets/auth/google.png',
  // MM-QA-003 — Next /shop + vendor chrome
  'apps/vendor-dashboard/public/mmall-bag.png',
  'apps/vendor-dashboard/public/mmall-wordmark.png',
  'apps/vendor-dashboard/public/mmall-web-banner.png',
  'apps/vendor-dashboard/public/icon.png',
  'apps/vendor-dashboard/public/auth/google.png',
]

const failures = []

for (const rel of required) {
  const abs = join(root, rel)
  try {
    const stat = statSync(abs)
    const head = readFileSync(abs).subarray(0, 8)
    if (stat.size < 32) failures.push(`${rel}: too small (${stat.size} bytes)`)
    else if (!head.equals(PNG)) failures.push(`${rel}: not a PNG`)
    else console.log(`PASS ${rel} (${stat.size} bytes)`)
  } catch (error) {
    failures.push(`${rel}: ${error.code === 'ENOENT' ? 'missing' : error.message}`)
  }
}

if (failures.length) {
  console.error('\nBrand asset check failed:')
  for (const line of failures) console.error(`  ${line}`)
  process.exit(1)
}

console.log(`\n${required.length} brand PNGs present.`)
