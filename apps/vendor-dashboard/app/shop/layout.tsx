import type { Metadata } from 'next'
import { AdPopup } from '../../components/shop/AdPopup'
import { ShopFilterProvider } from '../../lib/ShopFilterProvider'

export const metadata: Metadata = {
  title: 'MMall',
  description: 'Your digital shopping mall.',
  icons: { icon: '/mmall-bag.png' },
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShopFilterProvider>
      {children}
      <AdPopup />
    </ShopFilterProvider>
  )
}
