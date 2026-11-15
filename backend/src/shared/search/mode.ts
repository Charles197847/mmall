export type SearchProvider = 'postgres' | 'elasticsearch'

export function searchProvider(env: NodeJS.ProcessEnv = process.env): SearchProvider {
  const configured = env.SEARCH_PROVIDER?.trim().toLowerCase()
  if (configured === 'postgres' || configured === 'postgresql') return 'postgres'
  if (configured === 'elasticsearch' || configured === 'elastic') return 'elasticsearch'
  return 'elasticsearch'
}

export function usePostgresSearch(env: NodeJS.ProcessEnv = process.env): boolean {
  return searchProvider(env) === 'postgres'
}
