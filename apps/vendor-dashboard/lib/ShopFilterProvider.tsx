'use client'

import { createContext, Suspense, useContext, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  defaultShopFilter,
  parseShopFilter,
  writeShopFilter,
  type ShopFilter,
} from './shopFilters'

const ShopFilterContext = createContext<{
  filter: ShopFilter
  setFilter: (patch: Partial<ShopFilter>) => void
  clear: () => void
}>({
  filter: defaultShopFilter,
  setFilter: () => undefined,
  clear: () => undefined,
})

function ShopFilterInner({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const filter = useMemo(() => parseShopFilter(params), [params])

  function replace(next: ShopFilter) {
    const query = new URLSearchParams(params.toString())
    writeShopFilter(query, next)
    const suffix = query.toString()
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false })
  }

  return (
    <ShopFilterContext.Provider
      value={{
        filter,
        setFilter: (patch) => {
          const next = { ...filter, ...patch }
          if (patch.price && patch.price !== 'custom') {
            next.min = null
            next.max = null
          }
          if ('category' in patch && patch.category !== filter.category) {
            next.subcategory = ''
            next.shops = []
          }
          if ('subcategory' in patch && patch.subcategory !== filter.subcategory && !('shops' in patch)) {
            next.shops = []
          }
          replace(next)
        },
        clear: () => replace(defaultShopFilter),
      }}
    >
      {children}
    </ShopFilterContext.Provider>
  )
}

export function ShopFilterProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <ShopFilterContext.Provider
          value={{ filter: defaultShopFilter, setFilter: () => undefined, clear: () => undefined }}
        >
          {children}
        </ShopFilterContext.Provider>
      }
    >
      <ShopFilterInner>{children}</ShopFilterInner>
    </Suspense>
  )
}

export function useShopFilter() {
  return useContext(ShopFilterContext)
}
