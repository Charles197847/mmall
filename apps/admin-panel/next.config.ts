import type { NextConfig } from 'next'
import path from 'node:path'

const nextConfig: NextConfig = {
  transpilePackages: ['@shopping-mall/api-client', '@shopping-mall/shared-types'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
}

export default nextConfig
