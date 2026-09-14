import { useEffect } from 'react'
import { shopperAreaFromAddress } from '@shopping-mall/shared-types'
import { useAuth } from '../../lib/auth/AuthProvider'
import { useAreaStore } from '../../stores/areaStore'

export function LocationSync() {
  const { user } = useAuth()
  const place = useAreaStore((state) => state.place)
  const setPlace = useAreaStore((state) => state.setPlace)

  useEffect(() => {
    if (place || !user?.deliveryAddress) return
    const next = shopperAreaFromAddress(user.deliveryAddress)
    if (next) setPlace(next)
  }, [place, user, setPlace])

  return null
}
