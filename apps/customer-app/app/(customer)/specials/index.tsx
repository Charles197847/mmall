import { ScrollView, Text, View } from 'react-native'
import { HeroDrop } from '../../../components/mall/HeroDrop'
import { ProductCard } from '../../../components/product/ProductCard'
import { CourtNav } from '../../../components/mall/CourtNav'
import { MallChrome } from '../../../components/mall/MallChrome'
import { FilterBar } from '../../../components/mall/FilterBar'
import { mallSpecials } from '../../../lib/mallOffers'
import { applyShopFilter } from '../../../lib/shopFilters'
import { useFilterStore } from '../../../stores/filterStore'
import { useAreaStore } from '../../../stores/areaStore'

export default function SpecialsScreen() {
  const filter = useFilterStore((state) => state.filter)
  const area = useAreaStore((state) => state.place)
  const items = applyShopFilter(mallSpecials(), filter, area)
  const [hero, ...rest] = items
  return (
    <View className="flex-1 bg-void">
      <MallChrome />
      <ScrollView contentContainerClassName="pb-12">
        <CourtNav />
        <View className="px-5 mb-4">
          <Text className="text-mute text-sm">Today</Text>
          <Text className="text-ice mt-1" style={{ fontSize: 34, fontWeight: '300' }}>
            Today's specials
          </Text>
          <Text className="text-mute mt-2">Shops on the mall with a live mark-down. Price and compare price as listed.</Text>
        </View>
        <FilterBar />
        {hero ? <HeroDrop product={hero} /> : null}
        <View className="flex-row flex-wrap px-2 mt-8">
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
