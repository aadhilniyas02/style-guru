import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// ── Types matching the DB schema ─────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  skin_tone: 'fair' | 'medium' | 'tan' | 'dark'
  body_type: 'slim' | 'average' | 'athletic' | 'broad'
  created_at: string
}

export interface WardrobeItemRow {
  id: string
  user_id: string
  photo_url: string
  clothing_type: string
  primary_category?: string | null
  specific_label?: string | null
  colors: string[]
  formality: 'casual' | 'smart-casual' | 'formal'
  pattern: 'plain' | 'striped' | 'checked' | 'printed'
  season: 'all' | 'summer' | 'winter'
  tags: string[]
  created_at: string
}

export interface OutfitSuggestionRow {
  id: string
  user_id: string
  occasion: string
  item_ids: string[]
  feedback: 'liked' | 'disliked' | null
  weather_temp: number
  created_at: string
}
