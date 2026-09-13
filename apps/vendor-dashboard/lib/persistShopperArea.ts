import type { ShopperArea } from '@shopping-mall/shared-types'
import { api } from './api'
import { writeShopperArea } from './shopperLocation'
import { useAuthStore } from '../stores/authStore'

export async function persistShopperArea(area: ShopperArea | null) {
  writeShopperArea(area)
  const { token, user, setSession } = useAuthStore.getState()
  if (!token || !area) return
  try {
    const updated = await api.auth.updateAddress({
      fullName: user ? `${user.firstName} ${user.lastName}` : undefined,
      line1: user?.deliveryAddress?.line1 ?? user?.deliveryAddress?.line2,
      street: user?.deliveryAddress?.line1,
      city: area.city,
      state: area.province,
      postalCode: area.postalCode,
      country: 'South Africa',
    })
    if (user) setSession(token, { ...user, deliveryAddress: updated.deliveryAddress })
  } catch {
    // Shop still works from the device area if the API is down.
  }
}
