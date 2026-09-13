import { GuestChrome } from '../../../components/shop/GuestChrome'
import { CourtNav } from '../../../components/shop/CourtNav'
import { ProductGrid } from '../../../components/shop/ProductGrid'
import { mallSpecials } from '../../../lib/mallOffers'

export default function SpecialsPage() {
  const items = mallSpecials()

  return (
    <GuestChrome>
      <CourtNav />
      <h1 className="text-3xl font-semibold">Today&apos;s specials</h1>
      <p className="mt-2 text-mute">Shops on the mall with a live mark-down. Price and compare price as listed.</p>
      <div className="mt-8">
        <ProductGrid products={items} />
      </div>
    </GuestChrome>
  )
}
