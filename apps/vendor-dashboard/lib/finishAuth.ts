import type { User } from '@shopping-mall/shared-types'

export function homeFor(user: User) {
  return user.role === 'CUSTOMER' ? '/shop' : '/'
}

export function safeNext(next: string | null, user: User) {
  if (!next || !next.startsWith('/')) return homeFor(user)
  if (user.role === 'CUSTOMER' && !next.startsWith('/shop')) return '/shop'
  if (user.role === 'VENDOR' && next.startsWith('/shop') && next !== '/shop' && !next.startsWith('/shop/')) {
    return '/'
  }
  return next
}
