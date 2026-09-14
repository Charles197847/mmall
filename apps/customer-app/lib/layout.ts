/** Phone-first spacing and type. Keep these in sync across mall chrome and shopper screens. */
export const layout = {
  pageX: 16,
  section: 20,
  rail: 24,
  tap: 44,
  chip: 40,
  icon: 40,
  title: 28,
  titleLine: 32,
  heroBanner: 132,
  heroProduct: 252,
  productImage: 176,
  gridPadX: 10,
} as const

export const productGrid = {
  numColumns: 2 as const,
  columnWrapperStyle: { paddingHorizontal: layout.gridPadX },
}
