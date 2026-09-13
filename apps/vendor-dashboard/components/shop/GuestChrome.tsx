import Link from 'next/link'
import { ThemeToggle } from '../theme/ThemeToggle'
import { GuestFooter } from './GuestFooter'
import { HeaderActions } from './HeaderActions'
import { DeliverTo } from './DeliverTo'
import { LocationSync } from './LocationSync'
import { HeaderSearch } from './HeaderSearch'
import { ShopPromises } from './ShopPromises'

export function GuestChrome({ children }: { children: React.ReactNode }) {
  return (
    <div id="mm-shop-top" className="mm-shop flex min-h-screen flex-col text-ice">
      <LocationSync />
      <header className="sticky top-0 z-20 border-b border-[var(--mm-card-border)] bg-navy/90 backdrop-blur">
        <div className="mx-auto flex min-h-[5.5rem] w-[94%] items-center gap-6 py-5">
          <Link href="/shop" className="flex shrink-0 items-center gap-3">
            <img src="/mmall-bag.png" alt="" className="h-16 w-auto" />
            <img src="/mmall-wordmark.png" alt="M-MALL" className="mm-wordmark" />
          </Link>
          <DeliverTo />
          <HeaderSearch />
          <ShopPromises />
          <div className="flex shrink-0 items-center gap-6">
            <HeaderActions />
            <ThemeToggle />
            <Link href="/shop/join" className="text-sm text-ice hover:text-glow">
              Join
            </Link>
            <Link href="/shop/login?next=/shop" className="rounded-full bg-brand px-5 py-3 text-sm text-white hover:opacity-90">
              Sign in
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-[94%] flex-1 py-6">{children}</main>
      <GuestFooter />
    </div>
  )
}

export function money(value: number) {
  return `R${value.toFixed(2)}`
}
