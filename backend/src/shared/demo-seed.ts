const HOSTED_SUFFIXES = [
  '.supabase.co',
  '.supabase.com',
  '.pooler.supabase.com',
  '.neon.tech',
  '.render.com',
  '.railway.app',
  '.rds.amazonaws.com',
  '.amazonaws.com',
]

export class DemoSeedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DemoSeedError'
  }
}

function databaseHost(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

export function isHostedDatabaseHost(host: string): boolean {
  const normalized = host.toLowerCase()
  return HOSTED_SUFFIXES.some((suffix) => normalized === suffix.slice(1) || normalized.endsWith(suffix))
}

export function assertDemoSeedAllowed(env: NodeJS.ProcessEnv = process.env): void {
  if (env.ALLOW_DEMO_SEED === 'true') return
  const hosts = [databaseHost(env.DATABASE_URL), databaseHost(env.DIRECT_URL)].filter(
    (host): host is string => Boolean(host),
  )
  const hosted = hosts.some((host) => isHostedDatabaseHost(host))
  if (env.NODE_ENV === 'production' || hosted) {
    throw new DemoSeedError(
      'Refusing to seed demo accounts (password Password123!) into a production or hosted database. Set ALLOW_DEMO_SEED=true only for an intentional demo database, run the seed once, then unset the flag.',
    )
  }
}
