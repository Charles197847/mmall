'use client'

import { useEffect, useState } from 'react'
import type { ShopperArea } from '@shopping-mall/shared-types'
import { readShopperArea } from './shopperLocation'

export function useShopperArea() {
  const [area, setArea] = useState<ShopperArea | null>(null)

  useEffect(() => {
    const sync = () => setArea(readShopperArea())
    sync()
    window.addEventListener('mmall-deliver-to', sync)
    return () => window.removeEventListener('mmall-deliver-to', sync)
  }, [])

  return area
}
