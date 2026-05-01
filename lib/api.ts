import axios from 'axios'
import { Platform } from 'react-native'
import type { WardrobeItemRow } from './supabase'

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// ── Types ────────────────────────────────────────────────────────────────────

export interface AnalyzeItemResponse {
  photo_url: string
  clothing_type: string
  specific_label: string
  colors: string[]
  formality: 'casual' | 'smart-casual' | 'formal'
  pattern: 'plain' | 'striped' | 'checked' | 'printed'
  season: 'all' | 'summer' | 'winter'
  fabric: string
  fit: string
  tags: string[]
}

export interface OutfitSuggestion {
  item_ids: string[]
  explanation: string
  items?: WardrobeItemRow[]   // populated on the frontend by looking up item_ids
}

export interface SuggestOutfitsResponse {
  outfits: OutfitSuggestion[]
}

// ── Health check ─────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await client.get('/')
    return res.status === 200
  } catch {
    return false
  }
}

// ── Analyze clothing item from photo URI ─────────────────────────────────────

export async function analyzeItem(photoUri: string): Promise<AnalyzeItemResponse> {
  const formData = new FormData()

  if (Platform.OS === 'web') {
    // Web: fetch the blob URI and append as a real File object
    const response = await fetch(photoUri)
    const blob = await response.blob()
    formData.append('photo', blob, 'clothing.jpg')
  } else {
    // Native: React Native FormData accepts { uri, name, type }
    formData.append('photo', {
      uri: photoUri,
      name: 'clothing.jpg',
      type: 'image/jpeg',
    } as any)
  }

  // On web, let the browser set Content-Type automatically (includes the boundary).
  // On native, axios needs it set explicitly.
  const headers = Platform.OS === 'web'
    ? {}
    : { 'Content-Type': 'multipart/form-data' }

  const res = await client.post<AnalyzeItemResponse>('/analyze-item', formData, { headers })
  return res.data
}

// ── Get outfit suggestions ────────────────────────────────────────────────────

export interface SuggestOutfitsParams {
  wardrobe: WardrobeItemRow[]
  occasion: string
  weatherTemp: number
  skinTone?: string
  bodyType?: string
  setting?: 'indoor' | 'outdoor'
  timeOfDay?: 'day' | 'night'
}

export async function suggestOutfits(params: SuggestOutfitsParams): Promise<SuggestOutfitsResponse> {
  const res = await client.post<SuggestOutfitsResponse>('/suggest-outfits', {
    wardrobe: params.wardrobe,
    occasion: params.occasion,
    weather_temp: params.weatherTemp,
    skin_tone: params.skinTone ?? 'medium',
    body_type: params.bodyType ?? 'average',
    setting: params.setting ?? 'outdoor',
    time_of_day: params.timeOfDay ?? 'day',
  })
  return res.data
}
