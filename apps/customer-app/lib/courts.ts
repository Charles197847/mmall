export const mallCourts = [
  {
    id: 'fashion',
    name: 'Fashion',
    level: 'Level 1',
    line: 'Apparel, shoes, jewelry',
    categories: ['Fashion', 'Footwear', 'Jewelry', 'Sportswear'],
    cover: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80',
  },
  {
    id: 'tech',
    name: 'Tech',
    level: 'Level 2',
    line: 'Phones, audio, machines',
    categories: ['Electronics'],
    cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
  },
  {
    id: 'living',
    name: 'Home',
    level: 'Level 2',
    line: 'Rooms, outdoor, gifts',
    categories: ['Home', 'Outdoor', 'Gifts'],
    cover: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=1200&q=80',
  },
  {
    id: 'beauty',
    name: 'Beauty',
    level: 'Level 1',
    line: 'Skin, salon, wellness',
    categories: ['Beauty', 'Salons', 'Health'],
    cover: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=1200&q=80',
  },
  {
    id: 'taste',
    name: 'Food hall',
    level: 'Ground',
    line: 'Court meals and groceries',
    categories: ['Food Court', 'Hypermarkets'],
    cover: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
  },
  {
    id: 'leisure',
    name: 'Leisure',
    level: 'Level 3',
    line: 'Screens, play, books',
    categories: ['Cinemas', 'Family Entertainment', 'Books', 'Automotive'],
    cover: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  },
  {
    id: 'services',
    name: 'Services',
    level: 'Ground',
    line: 'Cards, forex, advice',
    categories: ['Financial Services'],
    cover: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  },
] as const

export type MallCourt = (typeof mallCourts)[number]

export function courtById(id?: string) {
  return mallCourts.find((court) => court.id === id)
}

export function courtForCategory(category?: string) {
  if (!category) return undefined
  return mallCourts.find((court) => (court.categories as readonly string[]).includes(category))
}
