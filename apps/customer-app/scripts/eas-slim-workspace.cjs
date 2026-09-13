const fs = require('fs')
const path = require('path')

if (process.env.EAS_BUILD !== 'true') {
  process.exit(0)
}

const workspaceRoot = path.resolve(__dirname, '../../..')
const dest = path.join(workspaceRoot, 'pnpm-workspace.yaml')

fs.writeFileSync(
  dest,
  [
    'packages:',
    '  - "apps/customer-app"',
    '  - "packages/*"',
    '',
    'publicHoistPattern:',
    '  - "*expo-modules-autolinking"',
    '  - "*expo-modules-core"',
    '  - "*babel-preset-expo"',
    'nodeLinker: hoisted',
    '',
  ].join('\n'),
)

console.log('EAS: limited pnpm workspace to customer-app and packages/*')
