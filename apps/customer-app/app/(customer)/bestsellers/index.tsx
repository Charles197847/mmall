import { ScrollView, View } from 'react-native'
import { HeroDrop } from '../../../components/mall/HeroDrop'
import { ProductCard } from '../../../components/product/ProductCard'
import { CourtNav } from '../../../components/mall/CourtNav'
import { MallChrome } from '../../../components/mall/MallChrome'
import { FilterBar } from '../../../components/mall/FilterBar'
import { PageTitle } from '../../../components/mall/PageTitle'
import { mallBestsellers } from '../../../lib/mallOffers'
import { applyShopFilter } from '../../../lib/shopFilters'
import { useFilterStore } from '../../../stores/filterStore'
import { useAreaStore } from '../../../stores/areaStore'

export default function BestsellersScreen() {
  const filter = useFilterStore((state) => state.filter)
  const area = useAreaStore((state) => state.place)
  const items = applyShopFilter(mallBestsellers(), filter, area)
  const [hero, ...rest] = items
  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <ScrollView contentContainerClassName="pb-12">
        <CourtNav />
        <PageTitle kicker="Moving" title="Best sellers" lede="What the mall is taking home this week." />
        <FilterBar />
        {hero ? <HeroDrop product={hero} /> : null}
        <View className="flex-row flex-wrap px-2 mt-4">
          {rest.map((item) => (
            <View key={item.id} className="w-1/2">
              <ProductCard product={item} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
