import { ensureDatabaseEnv, prismaCli, runNode } from './tooling.mjs'

ensureDatabaseEnv()
runNode(prismaCli(), ['generate'])
