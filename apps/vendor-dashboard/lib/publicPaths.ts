export function isPublicPath(pathname: string) {
  return (
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/shop' ||
    pathname.startsWith('/shop/')
  )
}
