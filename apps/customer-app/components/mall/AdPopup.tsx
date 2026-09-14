import { useEffect, useRef, useState } from 'react'
import { Image, Modal, Pressable, Text, View } from 'react-native'
import { usePathname, router } from 'expo-router'
import { mockAds } from '../../lib/catalog'

const SKIP = ['/login', '/register', '/join', '/sell', '/vendor-login', '/legal', '/checkout', '/payment-return']
const FIRST_MS = 8_000
const EVERY_MS = 40_000

export function AdPopup() {
  const pathname = usePathname() ?? ''
  const ads = mockAds('Popup', 8)
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const openRef = useRef(false)

  useEffect(() => {
    const show = () => {
      if (openRef.current) return
      openRef.current = true
      setOpen(true)
    }
    const startId = setTimeout(() => {
      show()
      interval = setInterval(show, EVERY_MS)
    }, FIRST_MS)
    let interval: ReturnType<typeof setInterval> | undefined
    return () => {
      clearTimeout(startId)
      if (interval) clearInterval(interval)
    }
  }, [])

  function close() {
    openRef.current = false
    setOpen(false)
    setIndex((current) => (current + 1) % ads.length)
  }

  if (!open || SKIP.some((part) => pathname.includes(part))) return null

  const ad = ads[index]
  if (!ad) return null

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View className="flex-1 bg-black/55 items-center justify-center px-5">
        <Pressable className="absolute inset-0" onPress={close} accessibilityLabel="Dismiss sponsored ad" />
        <View className="w-full max-w-xl bg-navy rounded-[28px] overflow-hidden">
          {ad.imageUrl ? (
            <Image source={{ uri: ad.imageUrl }} className="w-full h-52 bg-navy" resizeMode="cover" />
          ) : null}
          <View className="p-5">
            <Text className="text-[11px] tracking-[0.22em] text-glow">SPONSORED</Text>
            <Text className="text-ice text-xl font-semibold mt-2">{ad.title}</Text>
            {ad.headline ? <Text className="text-mute mt-1">{ad.headline}</Text> : null}
            <View className="flex-row justify-end mt-5">
              <Pressable onPress={close} className="px-4 py-2">
                <Text className="text-mute">Not now</Text>
              </Pressable>
              <Pressable
                className="rounded-full bg-brand px-5 py-2.5"
                onPress={() => {
                  close()
                  if (ad.vendorSlug) router.push(`/(customer)/vendor/${ad.vendorSlug}`)
                }}
              >
                <Text className="text-white font-semibold">Visit store</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
