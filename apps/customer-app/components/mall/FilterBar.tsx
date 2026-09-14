import { useState } from 'react'
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  categoryOptions,
  isDefaultShopFilter,
  priceOptions,
  reachOptions,
  shopFilterSummary,
  sortOptions,
} from '../../lib/shopFilters'
import { subcategoryRows } from '../../lib/filterCatalog'
import { layout } from '../../lib/layout'
import { useFilterStore } from '../../stores/filterStore'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'

function Chip({
  active,
  onPress,
  children,
  wrap = true,
}: {
  active: boolean
  onPress: () => void
  children: string
  wrap?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-3.5 mr-2 items-center justify-center ${wrap ? 'mb-2' : ''} ${active ? 'bg-brand' : 'bg-black/20'}`}
      style={{ minHeight: layout.chip }}
    >
      <Text className={`text-sm ${active ? 'text-white' : 'text-ice'}`}>{children}</Text>
    </Pressable>
  )
}

export function FilterBar() {
  const { filter, setFilter, clear } = useFilterStore()
  const [open, setOpen] = useState(false)
  const [openShops, setOpenShops] = useState('')
  const [minText, setMinText] = useState(filter.min != null ? String(filter.min) : '')
  const [maxText, setMaxText] = useState(filter.max != null ? String(filter.max) : '')
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const summary = shopFilterSummary(filter)
  const rows = filter.category ? subcategoryRows(filter.category) : []
  const insets = useSafeAreaInsets()

  function applyCustom() {
    let min = minText.trim() ? Number(minText) : null
    let max = maxText.trim() ? Number(maxText) : null
    if (min != null && !Number.isFinite(min)) min = null
    if (max != null && !Number.isFinite(max)) max = null
    if (min != null && max != null && min > max) {
      const swap = min
      min = max
      max = swap
    }
    setFilter({ price: 'custom', min, max })
  }

  function toggleShop(subcategory: string, shopId: string) {
    const current = filter.subcategory === subcategory ? filter.shops : []
    const shops = current.includes(shopId) ? current.filter((id) => id !== shopId) : [...current, shopId]
    setFilter({ subcategory, shops })
  }

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: layout.pageX, alignItems: 'center' }}
      >
        <Pressable
          onPress={() => setOpen(true)}
          className="flex-row items-center rounded-full bg-black/20 px-3 mr-2"
          style={{ minHeight: layout.chip }}
          accessibilityLabel={summary.length ? `Filters: ${summary.join(', ')}` : 'Open filters'}
        >
          <Feather name="sliders" size={16} color={colors.ice} />
          <Text className="text-sm font-semibold text-ice ml-1.5">Filters</Text>
        </Pressable>
        {categoryOptions.map((option) => (
          <Chip
            key={option.id}
            wrap={false}
            active={filter.category === option.id}
            onPress={() => setFilter({ category: filter.category === option.id ? '' : option.id })}
          >
            {`${option.icon} ${option.label}`}
          </Chip>
        ))}
        {isDefaultShopFilter(filter) ? null : (
          <Pressable onPress={clear} className="px-2" style={{ minHeight: layout.chip, justifyContent: 'center' }}>
            <Text className="text-sm font-semibold text-glow">Clear</Text>
          </Pressable>
        )}
      </ScrollView>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View
            className="bg-navy rounded-t-[28px] max-h-[86%] px-5 pt-5"
            style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-semibold text-ice">Filter</Text>
                <Text className="text-sm text-mute mt-1">
                  {summary.length ? summary.join(' · ') : 'Pick a category, then shops, then price and sort.'}
                </Text>
              </View>
              <Pressable
                onPress={() => setOpen(false)}
                className="rounded-full bg-black/20 items-center justify-center"
                style={{ width: layout.icon, height: layout.icon }}
              >
                <Feather name="x" size={18} color={colors.ice} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-sm font-semibold text-ice mb-3">Category</Text>
              <View className="flex-row flex-wrap mb-6">
                <Chip active={!filter.category} onPress={() => setFilter({ category: '' })}>
                  All
                </Chip>
                {categoryOptions.map((option) => (
                  <Chip
                    key={option.id}
                    active={filter.category === option.id}
                    onPress={() => setFilter({ category: option.id })}
                  >
                    {`${option.icon} ${option.label}`}
                  </Chip>
                ))}
              </View>

              {rows.length ? (
                <View className="mb-6">
                  <Text className="text-sm font-semibold text-ice mb-3">Subcategories in {filter.category}</Text>
                  {rows.map((row) => (
                    <View key={row.name} className="border-b border-ice/10 py-3">
                      <View className="flex-row items-center justify-between">
                        <Pressable
                          onPress={() =>
                            setFilter({ subcategory: filter.subcategory === row.name ? '' : row.name })
                          }
                          style={{ minHeight: layout.chip, justifyContent: 'center', flex: 1 }}
                        >
                          <Text
                            className={`text-sm font-medium ${
                              filter.subcategory === row.name ? 'text-glow' : 'text-ice'
                            }`}
                          >
                            {row.name}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => setOpenShops((current) => (current === row.name ? '' : row.name))}
                          className="rounded-full bg-black/20 px-3"
                          style={{ minHeight: layout.chip, justifyContent: 'center' }}
                        >
                          <Text className="text-sm font-semibold text-glow">
                            {row.shops.length} {row.shops.length === 1 ? 'shop' : 'shops'}
                          </Text>
                        </Pressable>
                      </View>
                      {openShops === row.name ? (
                        <View className="flex-row flex-wrap mt-3">
                          {row.shops.map((shop) => {
                            const checked = filter.subcategory === row.name && filter.shops.includes(shop.id)
                            return (
                              <Pressable
                                key={shop.id}
                                onPress={() => toggleShop(row.name, shop.id)}
                                className={`flex-row items-center rounded-full bg-black/20 px-2 mr-2 mb-2 ${
                                  checked ? 'border border-glow' : ''
                                }`}
                                style={{ minHeight: layout.chip }}
                              >
                                {shop.logo ? (
                                  <Image source={{ uri: shop.logo }} className="h-8 w-8 rounded-full bg-navy mr-2" />
                                ) : (
                                  <View className="h-8 w-8 rounded-full bg-brand/20 items-center justify-center mr-2">
                                    <Text className="text-glow text-xs">{shop.storeName[0]}</Text>
                                  </View>
                                )}
                                <Text className="text-sm text-ice pr-1">{shop.storeName}</Text>
                              </Pressable>
                            )
                          })}
                        </View>
                      ) : null}
                    </View>
                  ))}
                </View>
              ) : null}

              <Text className="text-sm font-semibold text-ice mb-3">Sort</Text>
              <View className="flex-row flex-wrap mb-6">
                {sortOptions.map((option) => (
                  <Chip
                    key={option.id}
                    active={filter.sort === option.id}
                    onPress={() => setFilter({ sort: option.id })}
                  >
                    {option.label}
                  </Chip>
                ))}
              </View>

              <Text className="text-sm font-semibold text-ice mb-3">Price</Text>
              <View className="flex-row flex-wrap mb-4">
                {priceOptions.map((option) => (
                  <Chip
                    key={option.id}
                    active={filter.price === option.id}
                    onPress={() => setFilter({ price: option.id })}
                  >
                    {option.label}
                  </Chip>
                ))}
              </View>
              {filter.price === 'custom' ? (
                <View className="flex-row items-center mb-6">
                  <TextInput
                    value={minText}
                    onChangeText={setMinText}
                    placeholder="Min"
                    placeholderTextColor={colors.mute}
                    keyboardType="numeric"
                    className="w-28 rounded-full bg-black/20 px-3 text-sm text-ice"
                    style={{ minHeight: layout.chip }}
                  />
                  <Text className="text-xs text-mute mx-2">to</Text>
                  <TextInput
                    value={maxText}
                    onChangeText={setMaxText}
                    placeholder="Max"
                    placeholderTextColor={colors.mute}
                    keyboardType="numeric"
                    className="w-28 rounded-full bg-black/20 px-3 text-sm text-ice"
                    style={{ minHeight: layout.chip }}
                  />
                  <Pressable onPress={applyCustom} className="ml-3" style={{ minHeight: layout.chip, justifyContent: 'center' }}>
                    <Text className="text-sm font-semibold text-glow">Apply</Text>
                  </Pressable>
                </View>
              ) : null}

              <Text className="text-sm font-semibold text-ice mb-3">From</Text>
              <View className="flex-row flex-wrap mb-6">
                {reachOptions.map((option) => (
                  <Chip
                    key={option.id}
                    active={filter.reach === option.id}
                    onPress={() => setFilter({ reach: option.id })}
                  >
                    {option.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>

            <View className="pt-3 border-t border-ice/10">
              {isDefaultShopFilter(filter) ? null : (
                <Pressable onPress={clear} className="mb-3 items-center" style={{ minHeight: 36, justifyContent: 'center' }}>
                  <Text className="text-sm font-semibold text-mute">Clear all</Text>
                </Pressable>
              )}
              <Pressable
                onPress={() => setOpen(false)}
                className="rounded-full bg-brand items-center justify-center"
                style={{ minHeight: layout.tap }}
              >
                <Text className="text-sm font-semibold text-white">Show results</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
