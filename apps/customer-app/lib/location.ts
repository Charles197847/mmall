import { Platform } from 'react-native'
import type { ShopperArea } from '@shopping-mall/shared-types'
import { findSaPlace, nearestSaPlace, shopperAreaFromAddress } from '@shopping-mall/shared-types'
import { api } from './api'
import { useAreaStore } from '../stores/areaStore'
import { sessionStore } from './session'
import type { User } from '@shopping-mall/shared-types'

export function areaFromQuery(query: string): ShopperArea | null {
  const place = findSaPlace(query)
  return place ? { ...place, source: 'search' } : null
}

async function readCoords(): Promise<{ latitude: number; longitude: number }> {
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => reject(new Error('Location permission was declined.')),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      )
    })
  }

  if (Platform.OS !== 'web') {
    try {
      const Location = await import('expo-location')
      const permission = await Location.requestForegroundPermissionsAsync()
      if (!permission.granted) throw new Error('Location permission was declined.')
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      return { latitude: position.coords.latitude, longitude: position.coords.longitude }
    } catch (error) {
      if (error instanceof Error && error.message.includes('declined')) throw error
    }
  }

  throw new Error('Location is not available on this device.')
}

export async function requestDeviceArea(): Promise<ShopperArea> {
  const coords = await readCoords()
  const place = nearestSaPlace(coords.latitude, coords.longitude)
  if (!place) throw new Error('Could not match a South African city.')
  return { ...place, source: 'gps' }
}

export async function persistShopperArea(area: ShopperArea | null, token?: string | null, user?: User | null) {
  useAreaStore.getState().setPlace(area)
  if (!token || !area) return
  try {
    const updated = await api.auth.updateAddress(
      {
        fullName: user ? `${user.firstName} ${user.lastName}` : undefined,
        line1: user?.deliveryAddress?.line1 ?? user?.deliveryAddress?.line2,
        street: user?.deliveryAddress?.line1,
        city: area.city,
        state: area.province,
        postalCode: area.postalCode,
        country: 'South Africa',
      },
      token,
    )
    if (user) {
      const next = { ...user, deliveryAddress: updated.deliveryAddress }
      await sessionStore.write(sessionStore.USER, JSON.stringify(next))
    }
  } catch {
    /* local area still works offline */
  }
}

export function areaFromUser(user: User | null): ShopperArea | null {
  const saved = user?.deliveryAddress
  return saved ? shopperAreaFromAddress(saved) : null
}
