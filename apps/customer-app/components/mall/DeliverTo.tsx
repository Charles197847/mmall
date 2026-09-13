import { useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { saPlaces, searchSaPlaces } from '@shopping-mall/shared-types'
import { useAreaStore } from '../../stores/areaStore'
import { mmall } from '../../lib/theme'

export function DeliverTo() {
  const place = useAreaStore((state) => state.place)
  const setPlace = useAreaStore((state) => state.setPlace)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const matches = useMemo(() => (query.trim() ? searchSaPlaces(query) : saPlaces.slice(0, 10)), [query])

  return (
    <>
      <Pressable onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel="Choose delivery city">
        <Text className="text-[10px] tracking-wide text-mute">Deliver to</Text>
        <Text className="text-sm font-semibold text-ice" numberOfLines={1}>
          {place ? `${place.city} ${place.postalCode}` : 'South Africa'}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/45 justify-center px-5" onPress={() => setOpen(false)}>
          <Pressable className="bg-navy rounded-xl p-5" onPress={() => undefined}>
            <Text className="text-lg font-semibold text-ice">Where should we deliver?</Text>
            <Text className="mt-1 text-sm text-mute">
              We only keep a suburb or postcode so nearby shops show first. The rest of South Africa stays visible.
            </Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Suburb or postcode, e.g. Sandton or 2196"
              placeholderTextColor={mmall.mute}
              className="mt-3 rounded-lg bg-black/20 px-3 py-2 text-sm text-ice"
            />
            <ScrollView className="mt-3 max-h-56">
              {matches.map((item) => (
                <Pressable
                  key={`${item.city}-${item.postalCode}`}
                  className="rounded-lg px-3 py-2"
                  onPress={() => {
                    setPlace(item)
                    setOpen(false)
                    setQuery('')
                  }}
                >
                  <Text className="text-ice font-medium">{item.city}</Text>
                  <Text className="text-mute text-xs">
                    {item.postalCode} · {item.province}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            {place ? (
              <Pressable
                className="mt-3"
                onPress={() => {
                  setPlace(null)
                  setOpen(false)
                }}
              >
                <Text className="text-sm text-mute">Clear and show all of South Africa</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
