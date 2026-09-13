import type { ShopperArea } from '@shopping-mall/shared-types'
import { findSaPlace, nearestSaPlace } from '@shopping-mall/shared-types'

const KEY = 'mmall-deliver-to'

export function readShopperArea(): ShopperArea | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ShopperArea) : null
  } catch {
    return null
  }
}

export function writeShopperArea(area: ShopperArea | null) {
  if (area) window.localStorage.setItem(KEY, JSON.stringify(area))
  else window.localStorage.removeItem(KEY)
  window.dispatchEvent(new Event('mmall-deliver-to'))
}

export function areaFromQuery(query: string): ShopperArea | null {
  const place = findSaPlace(query)
  return place ? { ...place, source: 'search' } : null
}

export function requestDeviceArea(): Promise<ShopperArea> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Location is not available on this device.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const place = nearestSaPlace(position.coords.latitude, position.coords.longitude)
        if (!place) {
          reject(new Error('Could not match a South African city.'))
          return
        }
        resolve({ ...place, source: 'gps' })
      },
      () => reject(new Error('Location permission was declined.')),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    )
  })
}
