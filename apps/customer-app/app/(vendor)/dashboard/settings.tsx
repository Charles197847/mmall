import { useEffect, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { findSaPlace } from '@shopping-mall/shared-types'
import { useAuth } from '../../../lib/auth/AuthProvider'
import { api } from '../../../lib/api'
import { DeskShell } from '../../../components/vendor/DeskShell'
import { palettes } from '../../../lib/theme'
import { useThemeStore } from '../../../stores/themeStore'

export default function VendorSettingsScreen() {
  const { token } = useAuth()
  const colors = palettes[useThemeStore((state) => state.mode)]
  const me = useQuery({
    queryKey: ['vendor-me', token],
    queryFn: () => api.auth.me(token!),
    enabled: Boolean(token),
  })
  const vendor = me.data?.vendor
  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [primary, setPrimary] = useState('#2563eb')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!vendor) return
    setStoreName(vendor.storeName ?? '')
    setDescription(vendor.description ?? '')
    setCity(vendor.city ?? '')
    setPrimary(vendor.settings?.theme?.primaryColor ?? '#2563eb')
  }, [vendor])

  return (
    <DeskShell title="Store settings">
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="Store name" placeholderTextColor={colors.mute} value={storeName} onChangeText={setStoreName} />
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2 min-h-[80px]" multiline placeholder="Description" placeholderTextColor={colors.mute} value={description} onChangeText={setDescription} />
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-2" placeholder="City" placeholderTextColor={colors.mute} value={city} onChangeText={setCity} />
      <TextInput className="bg-panel rounded-xl px-3 py-3 text-ice mb-4" placeholder="Theme primary colour" placeholderTextColor={colors.mute} value={primary} onChangeText={setPrimary} />
      <Pressable
        className="rounded-full bg-brand py-3"
        disabled={saving || !token}
        onPress={async () => {
          setSaving(true)
          setMessage('')
          try {
            const place = findSaPlace(city)
            await api.vendors.update(
              {
                storeName,
                description,
                city: place?.city ?? city,
                province: place?.province,
                postalCode: place?.postalCode,
                lat: place?.lat,
                lng: place?.lng,
                settings: {
                  theme: { primaryColor: primary, secondaryColor: '#6b7280', fontFamily: 'Inter' },
                  banner: vendor?.settings?.banner ?? null,
                  socialLinks: vendor?.settings?.socialLinks ?? {},
                },
              },
              token!,
            )
            await me.refetch()
            setMessage('Settings updated.')
          } catch {
            setMessage('Could not save settings.')
          } finally {
            setSaving(false)
          }
        }}
      >
        <Text className="text-white text-center font-semibold">{saving ? 'Saving…' : 'Save settings'}</Text>
      </Pressable>
      {message ? <Text className="text-mute mt-3">{message}</Text> : null}
    </DeskShell>
  )
}
