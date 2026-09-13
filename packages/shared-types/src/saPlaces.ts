export type SaMetro = 'CPT' | 'JHB' | 'DBN' | 'PE' | 'BFN' | 'ELS' | 'PLK' | 'NLP' | 'KIM' | 'RUS' | 'GRJ' | 'PMB' | 'OTHER'

export type SaPlace = {
  city: string
  province: string
  postalCode: string
  lat: number
  lng: number
  metro: SaMetro
}

export type ShopperArea = SaPlace & {
  source: 'gps' | 'search'
}

export const saPlaces: SaPlace[] = [
  { city: 'Cape Town', province: 'Western Cape', postalCode: '8001', lat: -33.9249, lng: 18.4241, metro: 'CPT' },
  { city: 'Bellville', province: 'Western Cape', postalCode: '7530', lat: -33.9, lng: 18.633, metro: 'CPT' },
  { city: 'Stellenbosch', province: 'Western Cape', postalCode: '7600', lat: -33.9324, lng: 18.8602, metro: 'CPT' },
  { city: 'Somerset West', province: 'Western Cape', postalCode: '7130', lat: -34.076, lng: 18.843, metro: 'CPT' },
  { city: 'George', province: 'Western Cape', postalCode: '6530', lat: -33.964, lng: 22.459, metro: 'GRJ' },
  { city: 'Johannesburg', province: 'Gauteng', postalCode: '2001', lat: -26.2041, lng: 28.0473, metro: 'JHB' },
  { city: 'Sandton', province: 'Gauteng', postalCode: '2196', lat: -26.1076, lng: 28.0567, metro: 'JHB' },
  { city: 'Pretoria', province: 'Gauteng', postalCode: '0002', lat: -25.7479, lng: 28.2293, metro: 'JHB' },
  { city: 'Midrand', province: 'Gauteng', postalCode: '1685', lat: -25.989, lng: 28.128, metro: 'JHB' },
  { city: 'Randburg', province: 'Gauteng', postalCode: '2194', lat: -26.094, lng: 27.998, metro: 'JHB' },
  { city: 'Soweto', province: 'Gauteng', postalCode: '1804', lat: -26.2485, lng: 27.854, metro: 'JHB' },
  { city: 'Centurion', province: 'Gauteng', postalCode: '0157', lat: -25.8603, lng: 28.1894, metro: 'JHB' },
  { city: 'Durban', province: 'KwaZulu-Natal', postalCode: '4001', lat: -29.8587, lng: 31.0218, metro: 'DBN' },
  { city: 'Umhlanga', province: 'KwaZulu-Natal', postalCode: '4320', lat: -29.728, lng: 31.085, metro: 'DBN' },
  { city: 'Pinetown', province: 'KwaZulu-Natal', postalCode: '3610', lat: -29.821, lng: 30.873, metro: 'DBN' },
  { city: 'Pietermaritzburg', province: 'KwaZulu-Natal', postalCode: '3201', lat: -29.6006, lng: 30.3794, metro: 'PMB' },
  { city: 'Richards Bay', province: 'KwaZulu-Natal', postalCode: '3900', lat: -28.781, lng: 32.038, metro: 'OTHER' },
  { city: 'Gqeberha', province: 'Eastern Cape', postalCode: '6001', lat: -33.9608, lng: 25.6022, metro: 'PE' },
  { city: 'East London', province: 'Eastern Cape', postalCode: '5201', lat: -33.0153, lng: 27.9116, metro: 'ELS' },
  { city: 'Bloemfontein', province: 'Free State', postalCode: '9301', lat: -29.0852, lng: 26.1596, metro: 'BFN' },
  { city: 'Polokwane', province: 'Limpopo', postalCode: '0699', lat: -23.9045, lng: 29.4689, metro: 'PLK' },
  { city: 'Mbombela', province: 'Mpumalanga', postalCode: '1200', lat: -25.4753, lng: 30.9694, metro: 'NLP' },
  { city: 'Kimberley', province: 'Northern Cape', postalCode: '8301', lat: -28.7282, lng: 24.7499, metro: 'KIM' },
  { city: 'Rustenburg', province: 'North West', postalCode: '0299', lat: -25.667, lng: 27.242, metro: 'RUS' },
]

export function metroCode(city?: string | null): SaMetro {
  if (!city) return 'OTHER'
  const match = saPlaces.find((place) => place.city.toLowerCase() === city.trim().toLowerCase())
  if (match) return match.metro
  const value = city.trim().toLowerCase()
  if (/(cape town|bellville|parow|wynberg|somerset west|stellenbosch)/.test(value)) return 'CPT'
  if (/(johannesburg|sandton|pretoria|midrand|randburg|soweto|centurion)/.test(value)) return 'JHB'
  if (/(durban|umhlanga|pinetown|westville)/.test(value)) return 'DBN'
  if (/(gqeberha|port elizabeth)/.test(value)) return 'PE'
  return 'OTHER'
}

export function findSaPlace(query: string) {
  const value = query.trim().toLowerCase()
  if (!value) return null
  return (
    saPlaces.find((place) => place.postalCode === value) ??
    saPlaces.find((place) => place.city.toLowerCase() === value) ??
    saPlaces.find((place) => place.city.toLowerCase().includes(value)) ??
    null
  )
}

export function searchSaPlaces(query: string, limit = 8) {
  const value = query.trim().toLowerCase()
  if (!value) return saPlaces.slice(0, limit)
  return saPlaces
    .filter(
      (place) =>
        place.city.toLowerCase().includes(value) ||
        place.postalCode.startsWith(value) ||
        place.province.toLowerCase().includes(value),
    )
    .slice(0, limit)
}

export function shopperAreaFromAddress(address?: { city?: string | null; postalCode?: string | null } | null): ShopperArea | null {
  if (!address?.city && !address?.postalCode) return null
  const place = findSaPlace(address.city ?? '') ?? findSaPlace(address.postalCode ?? '')
  return place ? { ...place, source: 'search' } : null
}

export function nearestSaPlace(lat: number, lng: number) {
  return saPlaces
    .map((place) => ({ place, km: haversineKm(lat, lng, place.lat, place.lng) }))
    .sort((a, b) => a.km - b.km)[0]?.place
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function deliveryLane(fromCity?: string | null, toCity?: string | null): 'local' | 'regional' | 'national' {
  const from = metroCode(fromCity)
  const to = metroCode(toCity)
  if (from !== 'OTHER' && from === to) return 'local'
  if (from !== 'OTHER' && to !== 'OTHER') return 'regional'
  return 'national'
}

export function proximityLabel(area: ShopperArea | null, city?: string | null, lat?: number | null, lng?: number | null) {
  if (!city) return null
  if (!area) return city
  const lane = deliveryLane(city, area.city)
  const km =
    typeof lat === 'number' && typeof lng === 'number' ? haversineKm(area.lat, area.lng, lat, lng) : null
  if (lane === 'local') {
    if (km == null) return city
    return `${km < 1 ? '< 1 km' : `${km.toFixed(1)} km`} · ${city}`
  }
  if (lane === 'regional') return `Ships from ${city}`
  return `Ships from ${city} · national`
}

export function quoteCourierGuy(input: {
  collectionCity: string
  deliveryCity: string
  weightKg: number
}) {
  const weight = Math.max(1, Math.ceil(input.weightKg || 1))
  const band = deliveryLane(input.collectionCity, input.deliveryCity)
  const services = [
    { code: 'ECO' as const, name: 'Economy (3–5 working days)', days: 4, local: 79, regional: 99, national: 129, perKg: 18 },
    { code: 'OVN' as const, name: 'Overnight', days: 1, local: 149, regional: 189, national: 249, perKg: 28 },
    { code: 'SDD' as const, name: 'Same-day (metro)', days: 0, local: 219, regional: 0, national: 0, perKg: 36, sameDayOnly: true },
  ]
  return services.map((meta) => {
    const available = !(meta.sameDayOnly && band !== 'local')
    const base = meta[band]
    const amount = available ? Math.round((base + meta.perKg * (weight - 1)) * 100) / 100 : 0
    return {
      carrier: 'THE_COURIER_GUY' as const,
      serviceLevelCode: meta.code,
      serviceName: meta.name,
      amount,
      currency: 'ZAR' as const,
      estimatedDays: meta.days,
      available,
      note: available
        ? `The Courier Guy · ${band} lane · ${weight}kg`
        : 'Same-day is only available inside the same metro.',
    }
  })
}

export function proximityScore(area: ShopperArea | null, city?: string | null, lat?: number | null, lng?: number | null) {
  if (!area) return 0
  if (!city) return Number.POSITIVE_INFINITY
  const lane = deliveryLane(city, area.city)
  const laneWeight = lane === 'local' ? 0 : lane === 'regional' ? 1_000_000 : 2_000_000
  const km =
    typeof lat === 'number' && typeof lng === 'number' ? haversineKm(area.lat, area.lng, lat, lng) : 50_000
  return laneWeight + km
}
