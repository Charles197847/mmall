import { Pressable } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { toSavedItem, useSavedStore } from '../../stores/savedStore'
import { palettes } from '../../lib/theme'
import { useThemeStore } from '../../stores/themeStore'
import type { Product } from '@shopping-mall/shared-types'

export function LoveButton({ product }: { product: Pick<Product, 'id' | 'name' | 'price' | 'images' | 'vendor'> }) {
  const saved = useSavedStore((state) => state.items.some((item) => item.id === product.id))
  const toggle = useSavedStore((state) => state.toggle)
  const colors = palettes[useThemeStore((state) => state.mode)]

  return (
    <Pressable
      hitSlop={8}
      onPress={() => toggle(toSavedItem(product))}
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${product.name} from saved` : `Save ${product.name}`}
      className="absolute top-2 right-2 z-10 w-9 h-9 rounded-full bg-navy/80 items-center justify-center"
    >
      <Feather name="heart" size={16} color={saved ? colors.signal : colors.ice} />
    </Pressable>
  )
}
