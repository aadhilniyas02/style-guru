export interface Occasion {
  id: string
  label: string
  icon: string   // Ionicons icon name
  description: string
}

export const OCCASIONS: Occasion[] = [
  { id: 'casual',    label: 'Casual',          icon: 'sunny-outline',       description: 'Everyday relaxed wear' },
  { id: 'office',    label: 'Office',          icon: 'briefcase-outline',   description: 'Professional work attire' },
  { id: 'party',     label: 'Party',           icon: 'musical-notes-outline', description: 'Social gatherings' },
  { id: 'wedding',   label: 'Wedding',         icon: 'diamond-outline',     description: 'Formal celebrations' },
]
