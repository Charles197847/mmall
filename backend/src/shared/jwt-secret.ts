const PLACEHOLDER_SECRETS = new Set([
  'dev-only-change-me',
  'change-me-to-a-long-random-secret',
  'change-me-in-docker',
  'secret',
  'changeme',
  'password',
  'jwt-secret',
  'jwt_secret',
])

export const MIN_JWT_SECRET_LENGTH = 32

export class JwtSecretError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JwtSecretError'
  }
}

export function assertProductionJwtSecret(env: NodeJS.ProcessEnv = process.env): void {
  if (env.NODE_ENV !== 'production') return
  const secret = env.JWT_SECRET?.trim() ?? ''
  if (secret.length < MIN_JWT_SECRET_LENGTH || PLACEHOLDER_SECRETS.has(secret)) {
    throw new JwtSecretError(
      'Refusing to start: production requires a unique JWT_SECRET of at least 32 characters. Placeholder or missing secrets are not allowed (MM-QA-032).',
    )
  }
}

export function getJwtSecret(env: NodeJS.ProcessEnv = process.env): string {
  assertProductionJwtSecret(env)
  const secret = env.JWT_SECRET?.trim()
  if (secret) return secret
  return 'dev-only-change-me'
}
