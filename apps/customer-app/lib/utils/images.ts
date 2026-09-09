export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80'

export function productImage(uri?: string | null) {
  return uri && uri.length > 0 ? uri : PLACEHOLDER_IMAGE
}
