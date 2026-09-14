import { useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { saPlaces, searchSaPlaces } from '@shopping-mall/shared-types'
import { useAreaStore } from '../../stores/areaStore'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import { persistShopperArea, requestDeviceArea } from '../../lib/location'
import { useAuth } from '../../lib/auth/AuthProvider'
import { layout } from '../../lib/layout'

export function DeliverTo({ tone = 'page' }: { tone?: 'page' | 'hero' | 'chrome' }) {
  const place = useAreaStore((state) => state.place)
  const { token, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)
  const matches = useMemo(() => (query.trim() ? searchSaPlaces(query) : saPlaces.slice(0, 10)), [query])
  const insets = useSafeAreaInsets()
  const mode = useThemeStore((state) => state.mode)
  const colors = palettes[mode]
  const hero = tone === 'hero'
  const chrome = tone === 'chrome'
  const label = place ? `${place.city} ${place.postalCode}` : 'South Africa'

  async function choose(next: typeof matches[number] | null, source: 'search' | 'gps' = 'search') {
    if (!next) {
      await persistShopperArea(null, token, user)
      setOpen(false)
      return
    }
    const area = { ...next, source }
    await persistShopperArea(area, token, user)
    setOpen(false)
    setQuery('')
    setError('')
  }

  async function useDevice() {
    setError('')
    setLocating(true)
    try {
      const area = await requestDeviceArea()
      await choose(area, 'gps')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read location.')
    } finally {
      setLocating(false)
    }
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Choose delivery city"
        style={chrome ? { minHeight: layout.chip, justifyContent: 'center' } : undefined}
      >
        {chrome ? (
          <View className="flex-row items-center">
            <Feather name="map-pin" size={14} color={colors.mute} />
            <Text className="text-sm font-semibold text-ice ml-1" numberOfLines={1}>
              {label}
            </Text>
          </View>
        ) : (
          <>
            <Text className={hero ? 'text-[10px] tracking-wide text-white/70' : 'text-[10px] tracking-wide text-mute'}>
              Deliver to
            </Text>
            <Text className={hero ? 'text-base text-white' : 'text-sm font-semibold text-ice'} numberOfLines={1}>
              {label}
            </Text>
          </>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-black/45">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View
            className="bg-navy rounded-t-[28px] px-5 pt-5"
            style={{ paddingBottom: Math.max(insets.bottom, 16) + 8, maxHeight: '86%' }}
          >
            <Text className="text-[26px] font-light text-ice">Where should we deliver?</Text>
            <Text className="mt-1 text-sm text-mute">
              We only keep a suburb or postcode so nearby shops show first. The rest of South Africa stays visible.
            </Text>
            <Pressable
              className="mt-4 w-full rounded-full bg-brand items-center justify-center"
              style={{ minHeight: layout.tap }}
              onPress={() => void useDevice()}
            >
              <Text className="text-white text-center font-semibold">
                {locating ? 'Finding you…' : 'Use my location'}
              </Text>
            </Pressable>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Suburb or postcode, e.g. Sandton or 2196"
              placeholderTextColor={colors.mute}
              className="mt-3 rounded-full bg-black/20 px-4 text-ice"
              style={{ minHeight: layout.tap, fontSize: 16 }}
            />
            <ScrollView className="mt-3" style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
              {matches.map((item) => (
                <Pressable
                  key={`${item.city}-${item.postalCode}`}
                  className="rounded-xl px-3"
                  style={{ minHeight: layout.tap, justifyContent: 'center' }}
                  onPress={() => void choose(item)}
                >
                  <Text className="text-ice font-medium">{item.city}</Text>
                  <Text className="text-mute text-xs">
                    {item.postalCode} · {item.province}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {error ? <Text className="mt-2 text-sm text-mute">{error}</Text> : null}
            {place ? (
              <Pressable className="mt-3 py-3" onPress={() => void choose(null)}>
                <Text className="text-sm text-mute">Clear and show all of South Africa</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  )
}
