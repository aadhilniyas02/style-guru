export const PRIMARY_CATEGORIES = [
  'shirt',
  'tshirt',
  'trousers',
  'shorts',
  'traditional',
] as const

export type PrimaryCategory = (typeof PRIMARY_CATEGORIES)[number]

export function formatClothingLabel(value: string): string {
  if (!value) return ''
  if (value.toLowerCase() === 'tshirt') return 'T-Shirt'
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
