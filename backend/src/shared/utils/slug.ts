export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function uniqueSlug(value: string) {
  return `${toSlug(value)}-${Date.now().toString().slice(-6)}`
}
