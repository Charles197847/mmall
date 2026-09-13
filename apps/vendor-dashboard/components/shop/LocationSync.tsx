'use client'

import { useEffect } from 'react'
import { shopperAreaFromAddress } from '@shopping-mall/shared-types'
import { api } from '../../lib/api'
import { readShopperArea, writeShopperArea } from '../../lib/shopperLocation'
import { useAuthStore } from '../../stores/authStore'

export function LocationSync() {
  const token = useAuthStore((state) => state.token)
  const setSession = useAuthStore((state) => state.setSession)

  useEffect(() => {
    if (!token) return
    void api.auth
      .me()
      .then((me) => {
        setSession(token, me)
        const fromAccount = shopperAreaFromAddress(me.deliveryAddress)
        const local = readShopperArea()
        if (fromAccount && !local) writeShopperArea(fromAccount)
      })
      .catch(() => undefined)
  }, [token, setSession])

  return null
}
