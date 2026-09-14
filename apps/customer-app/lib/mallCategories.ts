export const mallCategories = [
  { name: 'Electronics', icon: '📱' },
  { name: 'Home', icon: '🛋️' },
  { name: 'Hypermarkets', icon: '🛒' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Footwear', icon: '👟' },
  { name: 'Jewelry', icon: '💎' },
  { name: 'Sportswear', icon: '🏃' },
  { name: 'Beauty', icon: '💄' },
  { name: 'Salons', icon: '✂️' },
  { name: 'Food Court', icon: '🍔' },
  { name: 'Automotive', icon: '🚗' },
  { name: 'Cinemas', icon: '🎬' },
  { name: 'Family Entertainment', icon: '🎳' },
  { name: 'Books', icon: '📚' },
  { name: 'Gifts', icon: '🎁' },
  { name: 'Financial Services', icon: '🏦' },
  { name: 'Health', icon: '💊' },
  { name: 'Outdoor', icon: '🏕️' },
] as const

export const mallSubcategories: Record<string, string[]> = {
  Electronics: ['Phones', 'Computers', 'Audio', 'Wearables'],
  Home: ['Furniture', 'Kitchen', 'Decor', 'Bedding'],
  Hypermarkets: ['Groceries', 'Household', 'Drinks'],
  Fashion: ['Tops', 'Bottoms', 'Outerwear', 'Sets'],
  Footwear: ['Sneakers', 'Boots', 'Formal', 'Kids'],
  Jewelry: ['Gold', 'Silver', 'Watches', 'Accessories'],
  Sportswear: ['Training', 'Running', 'Gym gear'],
  Beauty: ['Skincare', 'Makeup', 'Fragrance', 'Hair'],
  Salons: ['Hair', 'Nails', 'Barber', 'Spa'],
  'Food Court': ['Meals', 'Snacks', 'Drinks'],
  Automotive: ['Parts', 'Accessories', 'Care', 'Tools'],
  Cinemas: ['Tickets', 'Snacks', 'Passes'],
  'Family Entertainment': ['Games', 'Rides', 'Parties'],
  Books: ['Fiction', 'Kids', 'Stationery'],
  Gifts: ['Hampers', 'Home gifts', 'Toys'],
  'Financial Services': ['Cards', 'Forex', 'Advice'],
  Health: ['Pharmacy', 'Wellness', 'Clinic'],
  Outdoor: ['Camping', 'Hiking', 'Rainwear'],
}

export function subcategoriesFor(category: string) {
  return mallSubcategories[category] ?? []
}
