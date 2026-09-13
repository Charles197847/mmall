import { ScrollView, Text, View } from 'react-native'
import { HeroDrop } from '../../../components/mall/HeroDrop'
import { ProductCard } from '../../../components/product/ProductCard'
import { mallBestsellers } from '../../../lib/mallOffers'

export default function BestsellersScreen() {
  const [hero, ...rest] = mallBestsellers()
  return (
    <ScrollView className="flex-1 bg-void" contentContainerClassName="pb-12 pt-14">
      <View className="px-4 mb-6">
        <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Moving</Text>
        <Text className="text-3xl font-semibold text-ice mt-1">Best sellers</Text>
        <Text className="text-mute mt-2">What the mall is taking home this week.</Text>
      </View>
      {hero ? <HeroDrop product={hero} /> : null}
      <View className="flex-row flex-wrap px-2 mt-8">
        {rest.map((item) => (
          <View key={item.id} className="w-1/2">
            <ProductCard product={item} />
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
