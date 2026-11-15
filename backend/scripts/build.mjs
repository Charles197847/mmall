import { ensureDatabaseEnv, prismaCli, runNode, tscCli } from './tooling.mjs'

ensureDatabaseEnv()
runNode(prismaCli(), ['generate'])
runNode(tscCli(), ['-p', 'tsconfig.json'])
