import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native'
import { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import OccasionPicker from '../../components/OccasionPicker'
import WeatherBadge from '../../components/WeatherBadge'
import OutfitCard from '../../components/OutfitCard'
import LoadingAI from '../../components/LoadingAI'
import ShimmerButton from '../../components/ShimmerButton'
import { useAuth } from '../../hooks/useAuth'
import { useWardrobe } from '../../hooks/useWardrobe'
import { suggestOutfits, type OutfitSuggestion } from '../../lib/api'
import type { WardrobeItemRow } from '../../lib/supabase'
import { getWeather } from '../../lib/weather'
import { THEME } from '../../constants/theme'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function HomeScreen() {
  const { user, profile } = useAuth()
  const { items, refetch } = useWardrobe(user?.id)
  const [occasion, setOccasion] = useState<string | null>(null)
  const [setting, setSetting] = useState<'indoor' | 'outdoor'>('outdoor')
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day')
  const [outfits, setOutfits] = useState<(OutfitSuggestion & { items: WardrobeItemRow[] })[]>([])
  const [loading, setLoading] = useState(false)
  const [weatherTemp, setWeatherTemp] = useState(31)

  function resolveOutfitItems(rawOutfits: OutfitSuggestion[]): (OutfitSuggestion & { items: WardrobeItemRow[] })[] {
    return rawOutfits
      .map(outfit => ({
        ...outfit,
        items: (outfit.item_ids ?? [])
          .map(itemId => items.find(item => item.id === itemId))
          .filter((item): item is WardrobeItemRow => Boolean(item)),
      }))
      .filter(outfit => outfit.items.length > 0)
  }

  useFocusEffect(useCallback(() => { refetch() }, [refetch]))

  useEffect(() => {
    getWeather().then(w => setWeatherTemp(w.temp)).catch(() => {})
  }, [])

  async function handleSuggest() {
    if (!occasion) { Alert.alert('Pick an Occasion', 'Select what you\'re dressing for.'); return }
    if (items.length === 0) { Alert.alert('Empty Wardrobe', 'Add some clothing items first.'); return }
    setLoading(true)
    setOutfits([])
    try {
      const result = await suggestOutfits({
        wardrobe: items,
        occasion,
        weatherTemp,
        skinTone: profile?.skin_tone ?? 'medium',
        bodyType: profile?.body_type ?? 'average',
        setting,
        timeOfDay,
      })
      setOutfits(resolveOutfitItems(result.outfits ?? []))
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not get suggestions. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroContent}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.heroTitle}>What are you{'\n'}dressing for?</Text>
          </View>
          <WeatherBadge />
        </View>

        {/* Occasion picker */}
        <OccasionPicker selected={occasion} onSelect={setOccasion} />

        {/* Context toggles */}
        <View style={styles.togglesRow}>
          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, setting === 'outdoor' && styles.toggleActive]}
              onPress={() => setSetting('outdoor')}
              activeOpacity={0.8}
            >
              <Ionicons name="sunny-outline" size={15} color={setting === 'outdoor' ? THEME.colors.primary : THEME.colors.textTertiary} />
              <Text style={[styles.toggleText, setting === 'outdoor' && styles.toggleTextActive]}>Outdoor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, setting === 'indoor' && styles.toggleActive]}
              onPress={() => setSetting('indoor')}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={15} color={setting === 'indoor' ? THEME.colors.primary : THEME.colors.textTertiary} />
              <Text style={[styles.toggleText, setting === 'indoor' && styles.toggleTextActive]}>Indoor</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[styles.toggleBtn, timeOfDay === 'day' && styles.toggleActive]}
              onPress={() => setTimeOfDay('day')}
              activeOpacity={0.8}
            >
              <Ionicons name="partly-sunny-outline" size={15} color={timeOfDay === 'day' ? THEME.colors.primary : THEME.colors.textTertiary} />
              <Text style={[styles.toggleText, timeOfDay === 'day' && styles.toggleTextActive]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, timeOfDay === 'night' && styles.toggleActive]}
              onPress={() => setTimeOfDay('night')}
              activeOpacity={0.8}
            >
              <Ionicons name="moon-outline" size={15} color={timeOfDay === 'night' ? THEME.colors.primary : THEME.colors.textTertiary} />
              <Text style={[styles.toggleText, timeOfDay === 'night' && styles.toggleTextActive]}>Night</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Suggest button */}
        <View style={styles.suggestSection}>
          <ShimmerButton onPress={handleSuggest} disabled={loading || !occasion}>
            <Ionicons name="sparkles" size={20} color={!occasion ? THEME.colors.textTertiary : THEME.colors.white} />
            <Text style={[styles.suggestText, !occasion && { color: THEME.colors.textTertiary }]}>
              Suggest Outfits
            </Text>
          </ShimmerButton>
        </View>

        {/* Loading AI */}
        <LoadingAI visible={loading} />

        {/* Results */}
        {outfits.length > 0 && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.results}>
            <Text style={styles.resultsTitle}>Your Outfits</Text>
            {outfits.map((outfit, i) => (
              <OutfitCard key={i} outfit={outfit} index={i} />
            ))}
          </Animated.View>
        )}

        {!loading && outfits.length === 0 && occasion && (
          <View style={styles.emptyResults}>
            <Ionicons name="shirt-outline" size={40} color={THEME.colors.textTertiary} />
            <Text style={styles.emptyText}>
              {items.length === 0 ? 'Add items to your wardrobe first' : 'Tap Suggest Outfits to get recommendations'}
            </Text>
          </View>
        )}

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background, overflow: 'hidden' },
  scroll: { paddingBottom: THEME.spacing.xxl },
  hero: {
    paddingHorizontal: THEME.spacing.xl,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: THEME.colors.primaryGlow,
    top: -80,
    right: -60,
    opacity: 0.3,
  },
  heroContent: { gap: THEME.spacing.xs },
  greeting: {
    fontSize: THEME.fontSize.md,
    color: THEME.colors.textTertiary,
    fontFamily: THEME.fonts.bodyMedium,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: THEME.fontSize.title,
    fontFamily: THEME.fonts.display,
    color: THEME.colors.text,
    letterSpacing: -1,
    lineHeight: 40,
  },
  togglesRow: {
    flexDirection: 'row',
    paddingHorizontal: THEME.spacing.xl,
    gap: THEME.spacing.sm + 4,
    marginTop: THEME.spacing.md,
    marginBottom: THEME.spacing.xs,
  },
  toggleGroup: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.sm + 4,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.radius.sm + 2,
  },
  toggleActive: { backgroundColor: THEME.colors.primaryLight },
  toggleText: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fonts.headingMedium,
    color: THEME.colors.textTertiary,
  },
  toggleTextActive: { color: THEME.colors.primary },
  suggestSection: {
    paddingHorizontal: THEME.spacing.xl,
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  suggestText: {
    color: THEME.colors.white,
    fontSize: THEME.fontSize.lg + 1,
    fontFamily: THEME.fonts.heading,
  },
  results: {
    paddingHorizontal: THEME.spacing.xl,
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.lg,
  },
  resultsTitle: {
    fontSize: THEME.fontSize.xxl - 6,
    fontFamily: THEME.fonts.display,
    color: THEME.colors.text,
    letterSpacing: -0.5,
  },
  emptyResults: { alignItems: 'center', gap: THEME.spacing.sm + 4, paddingTop: THEME.spacing.xxl },
  emptyText: {
    fontSize: THEME.fontSize.md,
    color: THEME.colors.textTertiary,
    fontFamily: THEME.fonts.bodyMedium,
    textAlign: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
})
