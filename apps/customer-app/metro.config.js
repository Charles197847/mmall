const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withCssInterop } = require('react-native-css-interop/metro')

const projectRoot = __dirname
const input = path.join(projectRoot, 'global.css')

// Gradle runs Metro from android/, so pin cwd before Expo resolves plugins.
if (process.cwd() !== projectRoot) {
  process.chdir(projectRoot)
}

function compileTailwind(platform) {
  const output = path.join(projectRoot, `.cache/tw-${platform}.css`)
  fs.mkdirSync(path.dirname(output), { recursive: true })
  const cli = require.resolve('tailwindcss/lib/cli.js')
  execFileSync(process.execPath, [cli, '--input', input, '--output', output], {
    cwd: projectRoot,
    env: { ...process.env, NATIVEWIND_OS: platform },
    stdio: 'inherit',
    timeout: 60000,
  })
  return fs.readFileSync(output)
}

const config = getDefaultConfig(projectRoot)

module.exports = withCssInterop(config, {
  input,
  inlineRem: 14,
  parent: { name: 'nativewind', debug: 'nativewind' },
  getCSSForPlatform: async (platform) => compileTailwind(platform),
})
