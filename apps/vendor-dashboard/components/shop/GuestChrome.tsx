import Link from 'next/link'
import { ThemeToggle } from '../theme/ThemeToggle'
import { GuestFooter } from './GuestFooter'
import { HeaderActions } from './HeaderActions'
import { DeliverTo } from './DeliverTo'
import { LocationSync } from './LocationSync'
import { HeaderSearch } from './HeaderSearch'
import { ShopPromises } from './ShopPromises'
import { ShopSession } from './ShopSession'

export function GuestChrome({ children }: { children: React.ReactNode }) {
  return (
    <div id="mm-shop-top" className="mm-shop flex min-h-screen flex-col text-ice">
      <LocationSync />
      <header className="sticky top-0 z-20 border-b border-[var(--mm-card-border)] bg-navy/90 backdrop-blur">
        <div className="mx-auto w-[94%] py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/shop" className="flex min-w-0 items-center gap-2 sm:gap-3">
              <img src="/mmall-bag.png" alt="" className="h-10 w-auto sm:h-16" />
              <img src="/mmall-wordmark.png" alt="M-MALL" className="mm-wordmark" />
            </Link>
            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <HeaderActions />
              <span className="sm:hidden">
                <ThemeToggle variant="icon" />
              </span>
              <span className="hidden sm:inline">
                <ThemeToggle />
              </span>
              <ShopSession />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <DeliverTo />
            <div className="min-w-0 flex-1">
              <HeaderSearch />
            </div>
          </div>
          <div className="mt-3 hidden lg:block">
            <ShopPromises />
          </div>
        </div>
      </header>
      <main className="mx-auto w-[94%] min-w-0 flex-1 py-6">{children}</main>
      <GuestFooter />
    </div>
  )
}

export function money(value: number) {
  return `R${value.toFixed(2)}`
}
