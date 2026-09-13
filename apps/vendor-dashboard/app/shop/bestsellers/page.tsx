import { GuestChrome } from '../../../components/shop/GuestChrome'
import { CourtNav } from '../../../components/shop/CourtNav'
import { ProductGrid } from '../../../components/shop/ProductGrid'
import { mallBestsellers } from '../../../lib/mallOffers'

export default function BestsellersPage() {
  return (
    <GuestChrome>
      <CourtNav />
      <h1 className="text-3xl font-semibold">Best sellers</h1>
      <p className="mt-2 text-mute">What the mall is moving — ranked from shop sales across courts, not a single store.</p>
      <div className="mt-8">
        <ProductGrid products={mallBestsellers()} />
      </div>
    </GuestChrome>
  )
}
