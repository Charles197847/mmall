import { ScrollView, Text, View } from 'react-native'
import { HeroDrop } from '../../../components/mall/HeroDrop'
import { ProductCard } from '../../../components/product/ProductCard'
import { mallSpecials } from '../../../lib/mallOffers'

export default function SpecialsScreen() {
  const [hero, ...rest] = mallSpecials()
  return (
    <ScrollView className="flex-1 bg-void" contentContainerClassName="pb-12 pt-14">
      <View className="px-4 mb-6">
        <Text className="text-[11px] tracking-[0.28em] text-mute uppercase">Today</Text>
        <Text className="text-3xl font-semibold text-ice mt-1">Marked down</Text>
        <Text className="text-mute mt-2">Windows with a live compare price. Not a coupon dump.</Text>
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
