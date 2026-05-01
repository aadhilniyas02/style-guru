import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator,
  Modal,
} from 'react-native'
import { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated'
import { useAuth } from '../../hooks/useAuth'
import { useWardrobe } from '../../hooks/useWardrobe'
import { formatClothingLabel } from '../../constants/clothing'
import ClothingItemCard from '../../components/ClothingItemCard'
import { THEME } from '../../constants/theme'

const CARD_GAP = 12

export interface WardrobeItem {
  id: string
  photo_url: string
  clothing_type: string
  primary_category?: string | null
  specific_label?: string | null
  colors: string[]
  formality: string
  pattern: string
  season: string
  tags: string[]
}

export default function WardrobeScreen() {
  const { user } = useAuth()
  const { items, loading, error, deleteItem, refetch } = useWardrobe(user?.id)
  const [filter, setFilter] = useState<string>('All')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  useFocusEffect(useCallback(() => { refetch() }, [refetch]))

  const availableFilters = ['All', ...Array.from(new Set(items.map(item => formatClothingLabel(item.primary_category ?? item.clothing_type))))]
  const filtered = filter === 'All'
    ? items
    : items.filter(i => formatClothingLabel(i.primary_category ?? i.clothing_type) === filter)

  async function confirmDelete(id: string) {
    setDeletingId(id)
    try {
      await deleteItem(id)
      await refetch()
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not delete item.')
    } finally {
      setDeletingId(current => (current === id ? null : current))
    }
  }

  function handleDelete(id: string) {
    setPendingDeleteId(id)
  }

  function closeDeleteModal() {
    if (!deletingId) {
      setPendingDeleteId(null)
    }
  }

  function handleConfirmDelete() {
    if (!pendingDeleteId) return
    void confirmDelete(pendingDeleteId)
    setPendingDeleteId(null)
  }

  function renderItem({ item, index }: { item: WardrobeItem; index: number }) {
    return (
      <View style={styles.cardWrap}>
        <ClothingItemCard item={item} onDelete={deletingId ? undefined : handleDelete} index={index} />
        {deletingId === item.id ? (
          <View style={styles.deletingOverlay}>
            <ActivityIndicator size="small" color={THEME.colors.white} />
            <Text style={styles.deletingText}>Deleting...</Text>
          </View>
        ) : null}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Wardrobe</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={availableFilters}
          keyExtractor={i => i}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={THEME.colors.primary} /></View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={THEME.colors.error} />
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}><Ionicons name="shirt-outline" size={48} color={THEME.colors.textTertiary} /></View>
          <Text style={styles.emptyTitle}>No items yet</Text>
          <Text style={styles.emptySubtitle}>Add clothes by tapping the + tab below</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Delete confirmation modal */}
      <Modal
        visible={pendingDeleteId !== null}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalBackdrop}>
          <Animated.View entering={ZoomIn.springify()} style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="trash-outline" size={22} color={THEME.colors.error} />
            </View>
            <Text style={styles.modalTitle}>Delete Item?</Text>
            <Text style={styles.modalText}>This removes the clothing item from your wardrobe and database.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={closeDeleteModal} disabled={!!deletingId}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleConfirmDelete} disabled={!!deletingId}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Bottom padding for floating tab bar */}
      <View style={{ height: 80 }} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: THEME.spacing.xl, paddingTop: THEME.spacing.sm + 4, paddingBottom: THEME.spacing.sm, gap: THEME.spacing.sm + 2 },
  title: { fontSize: THEME.fontSize.xxl + 2, fontFamily: THEME.fonts.display, color: THEME.colors.text, letterSpacing: -0.8 },
  countBadge: { backgroundColor: THEME.colors.primaryLight, borderRadius: THEME.radius.sm + 4, paddingHorizontal: THEME.spacing.sm + 4, paddingVertical: THEME.spacing.xs, borderWidth: 1, borderColor: THEME.colors.borderAccent },
  countText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.mono, color: THEME.colors.primary },

  filterWrapper: { flexShrink: 0 },
  filterRow: { paddingHorizontal: THEME.spacing.xl, paddingVertical: THEME.spacing.sm + 4, gap: THEME.spacing.sm, alignItems: 'flex-start' },
  filterChip: {
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    borderRadius: THEME.radius.sm + 2,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  filterText: { fontSize: THEME.fontSize.md - 1, fontFamily: THEME.fonts.heading, color: THEME.colors.textTertiary },
  filterTextActive: { color: THEME.colors.primary },

  grid: { paddingHorizontal: THEME.spacing.xl, paddingBottom: THEME.spacing.lg },
  row: { gap: CARD_GAP, marginBottom: CARD_GAP },
  cardWrap: { flex: 1, position: 'relative' },
  deletingOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(12,10,8,0.72)', alignItems: 'center', justifyContent: 'center', gap: THEME.spacing.sm, borderRadius: THEME.radius.lg - 4 },
  deletingText: { fontSize: THEME.fontSize.md - 1, fontFamily: THEME.fonts.heading, color: THEME.colors.white },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: THEME.spacing.lg },
  modalCard: { width: '100%', maxWidth: 340, backgroundColor: THEME.colors.card, borderRadius: THEME.radius.lg, padding: THEME.spacing.lg - 2, alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.borderLight },
  modalIconWrap: { width: 52, height: 52, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.accentDim, alignItems: 'center', justifyContent: 'center', marginBottom: THEME.spacing.md - 2 },
  modalTitle: { fontSize: THEME.fontSize.xl, fontFamily: THEME.fonts.display, color: THEME.colors.text, marginBottom: THEME.spacing.sm },
  modalText: { fontSize: THEME.fontSize.md, lineHeight: 20, color: THEME.colors.textSecondary, textAlign: 'center', marginBottom: THEME.spacing.xl, fontFamily: THEME.fonts.body },
  modalActions: { width: '100%', flexDirection: 'row', gap: THEME.spacing.sm + 2 },
  modalCancelBtn: { flex: 1, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.surface, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  modalCancelText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.text },
  modalDeleteBtn: { flex: 1, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.error, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  modalDeleteText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.white },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: THEME.spacing.sm + 4 },
  emptyIcon: { width: 80, height: 80, borderRadius: THEME.radius.lg, backgroundColor: THEME.colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: THEME.colors.border },
  emptyTitle: { fontSize: THEME.fontSize.lg + 2, fontFamily: THEME.fonts.display, color: THEME.colors.text },
  emptySubtitle: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.body },
})
