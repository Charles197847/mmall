const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const escape = (value) => value.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
const block = (relative) =>
  new RegExp(`^${escape(path.join(workspaceRoot, relative))}(?:[\\/\\\\]|$)`)

const config = getDefaultConfig(projectRoot)
config.watchFolders = [
  path.join(workspaceRoot, 'packages/shared-types'),
  path.join(workspaceRoot, 'packages/shared-ui'),
  path.join(workspaceRoot, 'packages/api-client'),
  path.join(workspaceRoot, 'packages/config'),
]
config.resolver.nodeModulesPaths = [
  path.join(projectRoot, 'node_modules'),
  path.join(workspaceRoot, 'node_modules'),
]
const defaultBlockList = config.resolver.blockList
config.resolver.blockList = [
  ...(Array.isArray(defaultBlockList)
    ? defaultBlockList
    : defaultBlockList
      ? [defaultBlockList]
      : []),
  block('apps/vendor-dashboard'),
  block('apps/admin-panel'),
  block('backend'),
]
config.resolver.disableHierarchicalLookup = true
config.resolver.unstable_enableSymlinks = true

module.exports = withNativeWind(config, { input: './global.css' })
