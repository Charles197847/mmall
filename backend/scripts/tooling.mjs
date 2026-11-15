import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function ensureDatabaseEnv() {
  const localUrl = 'postgresql://postgres:postgres@127.0.0.1:5433/shopping_mall'
  if (!process.env.DATABASE_URL) process.env.DATABASE_URL = localUrl
  if (!process.env.DIRECT_URL) process.env.DIRECT_URL = process.env.DATABASE_URL
}

const require = createRequire(path.join(backendRoot, 'package.json'))

export function prismaCli() {
  return path.join(path.dirname(require.resolve('prisma/package.json')), 'build', 'index.js')
}

export function tscCli() {
  return require.resolve('typescript/lib/tsc.js')
}

export function runNode(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: backendRoot,
    stdio: 'inherit',
    env: process.env,
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}
