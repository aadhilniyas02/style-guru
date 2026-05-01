import {
  View, Text, StyleSheet, TouchableOpacity, Image, Alert,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useAuth } from '../../hooks/useAuth'
import { useWardrobe } from '../../hooks/useWardrobe'
import { analyzeItem } from '../../lib/api'
import { PRIMARY_CATEGORIES, formatClothingLabel } from '../../constants/clothing'
import { THEME } from '../../constants/theme'
import ShimmerButton from '../../components/ShimmerButton'
import AnimatedPressable from '../../components/AnimatedPressable'

interface AnalysisResult {
  clothing_type: string
  specific_label: string
  colors: string[]
  formality: 'casual' | 'smart-casual' | 'formal'
  pattern: 'plain' | 'striped' | 'checked' | 'printed'
  season: 'all' | 'summer' | 'winter'
  fabric: string
  fit: string
  tags: string[]
  photo_url: string
}

export default function AddItemScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { addItem } = useWardrobe(user?.id)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission Required', 'Camera access is needed to photograph items.'); return }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [3, 4] })
    if (!res.canceled && res.assets[0]) { setPhotoUri(res.assets[0].uri); setResult(null); setSelectedType(null) }
  }

  async function handlePickGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') { Alert.alert('Permission Required', 'Photo library access is needed to pick items.'); return }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [3, 4] })
    if (!res.canceled && res.assets[0]) { setPhotoUri(res.assets[0].uri); setResult(null); setSelectedType(null) }
  }

  async function handleAnalyze() {
    if (!photoUri) return
    setAnalyzing(true)
    setError(null)
    try {
      console.log('[StyleGuru] Starting analysis for:', photoUri.slice(0, 80))
      const data = await analyzeItem(photoUri)
      console.log('[StyleGuru] Analysis success:', data)
      setResult(data)
      setSelectedType(data.clothing_type)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err.message || 'Could not analyze item. Make sure the backend is running.'
      console.error('[StyleGuru] Analysis error:', err)
      setError(msg)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSave() {
    if (!result || !user || !selectedType) return
    setSaving(true)
    setError(null)
    try {
      console.log('[StyleGuru] Saving item for user:', user.id)
      const extraTags: string[] = []
      if (result.fabric && result.fabric !== 'unknown') extraTags.push(`fabric:${result.fabric}`)
      if (result.fit && result.fit !== 'regular') extraTags.push(`fit:${result.fit}`)
      await addItem({
        user_id: user.id,
        photo_url: result.photo_url,
        clothing_type: selectedType,
        specific_label: result.specific_label,
        colors: result.colors,
        formality: result.formality,
        pattern: result.pattern,
        season: result.season || 'all',
        tags: [...(result.tags || []), ...extraTags],
      })
      setPhotoUri(null)
      setResult(null)
      setSelectedType(null)
      router.replace('/(tabs)/wardrobe')
    } catch (err: any) {
      const msg = err?.message || 'Could not save item.'
      console.error('[StyleGuru] Save error:', err)
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add to Wardrobe</Text>
        <Text style={styles.subtitle}>Photograph a clothing item and let AI do the rest</Text>

        {/* Photo area with viewfinder corners */}
        <View style={styles.photoArea}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.preview} />
          ) : (
            <View style={styles.placeholder}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.placeholderIcon}>
                <Ionicons name="camera-outline" size={48} color={THEME.colors.textTertiary} />
              </View>
              <Text style={styles.placeholderText}>Position your clothing item</Text>
            </View>
          )}
          {photoUri && (
            <TouchableOpacity style={styles.retakeBtn} onPress={() => { setPhotoUri(null); setResult(null); setSelectedType(null) }}>
              <Ionicons name="close-circle" size={28} color={THEME.colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <AnimatedPressable onPress={handleTakePhoto} style={{ flex: 1 }}>
            <View style={styles.actionBtn}>
              <View style={styles.actionIconBg}>
                <Ionicons name="camera-outline" size={24} color={THEME.colors.primary} />
              </View>
              <Text style={styles.actionLabel}>Camera</Text>
            </View>
          </AnimatedPressable>

          <AnimatedPressable onPress={handlePickGallery} style={{ flex: 1 }}>
            <View style={styles.actionBtn}>
              <View style={[styles.actionIconBg, { backgroundColor: THEME.colors.secondaryLight }]}>
                <Ionicons name="images-outline" size={24} color={THEME.colors.secondary} />
              </View>
              <Text style={styles.actionLabel}>Gallery</Text>
            </View>
          </AnimatedPressable>
        </View>

        {/* Analysis result */}
        {result && (
          <Animated.View entering={FadeInDown.springify()}>
            <View style={styles.resultCard}>
              <LinearGradient
                colors={[THEME.colors.gradientLuxStart, THEME.colors.gradientLuxEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.resultTopAccent}
              />
              <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={20} color={THEME.colors.secondary} />
                <Text style={styles.resultTitle}>AI Analysis Complete</Text>
              </View>
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Category</Text>
                  <Text style={styles.resultValue}>{formatClothingLabel(selectedType ?? result.clothing_type)}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Formality</Text>
                  <Text style={styles.resultValue}>{result.formality}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Fit</Text>
                  <Text style={styles.resultValue}>{result.fit}</Text>
                </View>
              </View>
              <View style={styles.resultGrid}>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Detected item</Text>
                  <Text style={styles.resultValue}>{formatClothingLabel(result.specific_label)}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>Fabric</Text>
                  <Text style={styles.resultValue}>{result.fabric}</Text>
                </View>
              </View>
              <View style={styles.selectorSection}>
                <Text style={styles.selectorTitle}>Confirm the category</Text>
                <View style={styles.selectorRow}>
                  {PRIMARY_CATEGORIES.map(option => {
                    const selected = selectedType === option
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[styles.selectorChip, selected && styles.selectorChipActive]}
                        onPress={() => setSelectedType(option)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.selectorChipText, selected && styles.selectorChipTextActive]}>{formatClothingLabel(option)}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Error */}
        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={18} color={THEME.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Analyze button */}
        {photoUri && !result && (
          <ShimmerButton onPress={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <>
                <ActivityIndicator color={THEME.colors.white} size="small" />
                <Text style={styles.analyzeBtnText}>Analyzing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="scan" size={20} color={THEME.colors.white} />
                <Text style={styles.analyzeBtnText}>Analyze with AI</Text>
              </>
            )}
          </ShimmerButton>
        )}

        {result && (
          <ShimmerButton onPress={handleSave} disabled={saving} colors={[THEME.colors.secondary, THEME.colors.secondary]}>
            {saving ? (
              <ActivityIndicator color={THEME.colors.black} size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color={THEME.colors.black} />
                <Text style={[styles.analyzeBtnText, { color: THEME.colors.black }]}>Save to Wardrobe</Text>
              </>
            )}
          </ShimmerButton>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  container: { padding: THEME.spacing.xl, paddingBottom: THEME.spacing.xxl, gap: THEME.spacing.xl },
  title: { fontSize: THEME.fontSize.xxl + 2, fontFamily: THEME.fonts.display, color: THEME.colors.text, letterSpacing: -0.8 },
  subtitle: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.bodyMedium, marginTop: -THEME.spacing.sm - 4 },
  photoArea: { borderRadius: THEME.radius.lg, overflow: 'hidden', backgroundColor: THEME.colors.card, borderWidth: 1, borderColor: THEME.colors.border, aspectRatio: 3 / 4 },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: THEME.spacing.sm + 4 },
  placeholderIcon: { width: 80, height: 80, borderRadius: THEME.radius.lg, backgroundColor: THEME.colors.surface, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.bodyMedium },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: THEME.colors.primary },
  cornerTL: { top: 16, left: 16, borderLeftWidth: 2, borderTopWidth: 2 },
  cornerTR: { top: 16, right: 16, borderRightWidth: 2, borderTopWidth: 2 },
  cornerBL: { bottom: 16, left: 16, borderLeftWidth: 2, borderBottomWidth: 2 },
  cornerBR: { bottom: 16, right: 16, borderRightWidth: 2, borderBottomWidth: 2 },
  retakeBtn: { position: 'absolute', top: THEME.spacing.sm + 4, right: THEME.spacing.sm + 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: THEME.radius.md },
  actions: { flexDirection: 'row', gap: THEME.spacing.sm + 4 },
  actionBtn: { backgroundColor: THEME.colors.card, borderRadius: THEME.radius.lg - 4, paddingVertical: THEME.spacing.xl, alignItems: 'center', gap: THEME.spacing.sm + 2, borderWidth: 1, borderColor: THEME.colors.border },
  actionIconBg: { width: 48, height: 48, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { fontSize: THEME.fontSize.md - 1, fontFamily: THEME.fonts.heading, color: THEME.colors.textSecondary },
  resultCard: { backgroundColor: THEME.colors.card, borderRadius: THEME.radius.lg - 4, padding: THEME.spacing.xl, gap: THEME.spacing.md, borderWidth: 1, borderColor: THEME.colors.borderAccent, overflow: 'hidden' },
  resultTopAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: THEME.spacing.sm },
  resultTitle: { fontSize: THEME.fontSize.lg, fontFamily: THEME.fonts.heading, color: THEME.colors.secondary },
  resultGrid: { flexDirection: 'row', gap: THEME.spacing.sm + 4 },
  resultItem: { flex: 1, backgroundColor: THEME.colors.surface, borderRadius: THEME.radius.sm + 4, padding: THEME.spacing.sm + 4, gap: THEME.spacing.xs },
  resultLabel: { fontSize: THEME.fontSize.xs, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.headingMedium, textTransform: 'uppercase', letterSpacing: 0.5 },
  resultValue: { fontSize: THEME.fontSize.md + 1, color: THEME.colors.text, fontFamily: THEME.fonts.heading, textTransform: 'capitalize' },
  selectorSection: { gap: THEME.spacing.sm + 2 },
  selectorTitle: { fontSize: THEME.fontSize.md - 1, color: THEME.colors.textSecondary, fontFamily: THEME.fonts.heading },
  selectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: THEME.spacing.sm },
  selectorChip: { borderRadius: THEME.radius.full, paddingHorizontal: THEME.spacing.sm + 4, paddingVertical: THEME.spacing.sm, backgroundColor: THEME.colors.surface, borderWidth: 1, borderColor: THEME.colors.border },
  selectorChipActive: { backgroundColor: THEME.colors.secondaryLight, borderColor: THEME.colors.secondary },
  selectorChipText: { fontSize: THEME.fontSize.md - 1, color: THEME.colors.textSecondary, fontFamily: THEME.fonts.heading, textTransform: 'capitalize' },
  selectorChipTextActive: { color: THEME.colors.secondary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: THEME.spacing.sm },
  tagPill: { backgroundColor: THEME.colors.surface, borderRadius: THEME.radius.sm, paddingHorizontal: THEME.spacing.sm + 2, paddingVertical: THEME.spacing.xs + 1, borderWidth: 1, borderColor: THEME.colors.border },
  tagText: { fontSize: THEME.fontSize.sm, color: THEME.colors.textSecondary, fontFamily: THEME.fonts.bodyMedium },
  analyzeBtnText: { color: THEME.colors.white, fontSize: THEME.fontSize.lg + 1, fontFamily: THEME.fonts.heading },
  errorBox: { backgroundColor: THEME.colors.accentDim, borderWidth: 1, borderColor: 'rgba(224,122,95,0.3)', borderRadius: THEME.radius.md, padding: THEME.spacing.md - 2, flexDirection: 'row', alignItems: 'flex-start', gap: THEME.spacing.sm + 2 },
  errorText: { flex: 1, color: THEME.colors.error, fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.bodyMedium },
})
