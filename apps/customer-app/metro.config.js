const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const fs = require('fs')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

function resolveFrom(pkg, ...roots) {
  return path.dirname(require.resolve(`${pkg}/package.json`, { paths: roots }))
}

function resolveFromPnpmStore(pkg) {
  const store = path.join(workspaceRoot, 'node_modules/.pnpm')
  const encoded = pkg.startsWith('@') ? pkg.replace('/', '+') : pkg
  const folder = fs
    .readdirSync(store)
    .filter((name) => name.startsWith(`${encoded}@`))
    .sort()
    .at(-1)
  if (!folder) return null
  return path.join(store, folder, 'node_modules', pkg)
}

const reactRoot = resolveFrom('react', projectRoot)
const reactDomRoot = resolveFrom('react-dom', projectRoot)

const config = getDefaultConfig(projectRoot)
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.unstable_enableSymlinks = true
config.resolver.blockList = [
  /[\\/]apps[\\/]vendor-dashboard[\\/].*/,
  /[\\/]apps[\\/]admin-panel[\\/].*/,
]

const extra = { ...(config.resolver.extraNodeModules ?? {}) }
extra.react = reactRoot
extra['react-dom'] = reactDomRoot

try {
  const nativewindRoot = resolveFrom('nativewind', projectRoot)
  extra['react-native-css-interop'] = resolveFrom('react-native-css-interop', nativewindRoot, projectRoot)
} catch {
  const cssInterop = resolveFromPnpmStore('react-native-css-interop')
  if (cssInterop) extra['react-native-css-interop'] = cssInterop
}

for (const pkg of [
  '@babel/runtime',
  '@tanstack/react-query',
  '@expo/vector-icons',
  '@expo/metro-runtime',
  '@react-native-async-storage/async-storage',
  'zustand',
]) {
  try {
    extra[pkg] = resolveFrom(pkg, projectRoot, workspaceRoot)
  } catch {
    const mapped = resolveFromPnpmStore(pkg)
    if (mapped) extra[pkg] = mapped
  }
}

config.resolver.extraNodeModules = extra

const withCss = withNativeWind(config, { input: './global.css' })
const upstreamResolve = withCss.resolver.resolveRequest

withCss.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [reactRoot] }),
    }
  }
  if (moduleName === 'react-dom' || moduleName.startsWith('react-dom/')) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName, { paths: [reactDomRoot] }),
    }
  }
  if (upstreamResolve) {
    return upstreamResolve(context, moduleName, platform)
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = withCss
