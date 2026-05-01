import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import Animated, { ZoomIn } from 'react-native-reanimated'
import { useAuth } from '../../hooks/useAuth'
import { useWardrobe } from '../../hooks/useWardrobe'
import { THEME } from '../../constants/theme'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

interface SettingRowProps { icon: IoniconsName; label: string; onPress: () => void; danger?: boolean }

function SettingRow({ icon, label, onPress, danger }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={danger ? THEME.colors.error : THEME.colors.textSecondary} />
      <Text style={[styles.settingLabel, danger && { color: THEME.colors.error }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={danger ? THEME.colors.error : THEME.colors.textTertiary} />
    </TouchableOpacity>
  )
}

function capitalize(s: string) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '—' }

const SKIN_TONES = ['fair', 'medium', 'tan', 'dark'] as const
const BODY_TYPES = ['slim', 'average', 'athletic', 'broad'] as const

export default function ProfileScreen() {
  const router = useRouter()
  const { user, profile, signOut, updateProfile } = useAuth()
  const { items } = useWardrobe(user?.id)

  const [signingOut, setSigningOut] = useState(false)
  const [showSignOutModal, setShowSignOutModal] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editSkinTone, setEditSkinTone] = useState('')
  const [editBodyType, setEditBodyType] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  function openEditModal() {
    setEditSkinTone(profile?.skin_tone ?? '')
    setEditBodyType(profile?.body_type ?? '')
    setEditError(null)
    setShowEditModal(true)
  }

  async function handleSaveProfile() {
    if (!editSkinTone || !editBodyType) {
      setEditError('Please select both skin tone and body type.')
      return
    }
    setSavingProfile(true)
    setEditError(null)
    try {
      await updateProfile(editSkinTone, editBodyType)
      setShowEditModal(false)
    } catch (err: any) {
      setEditError(err.message || 'Could not save. Please try again.')
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleSignOut() {
    setShowSignOutModal(false)
    setSigningOut(true)
    try {
      await signOut()
    } catch {
      setSigningOut(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarSection}>
          <LinearGradient colors={[THEME.colors.gradientStart, THEME.colors.gradientEnd]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={THEME.colors.textTertiary} />
            </View>
          </LinearGradient>
          <Text style={styles.email}>{user?.email ?? '—'}</Text>
          <View style={styles.planBadge}><Text style={styles.planText}>FREE PLAN</Text></View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{items.length}</Text>
            <Text style={styles.statLabel}>Wardrobe Items</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style Profile</Text>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Skin Tone</Text>
              <Text style={styles.profileValue}>{capitalize(profile?.skin_tone ?? '')}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Body Type</Text>
              <Text style={styles.profileValue}>{capitalize(profile?.body_type ?? '')}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.editProfileBtn} onPress={openEditModal}>
              <Text style={styles.editProfileText}>Edit Style Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.card}>
            <SettingRow icon="notifications-outline" label="Notifications" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow icon="location-outline" label="Weather Location" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => {}} />
            <View style={styles.divider} />
            <SettingRow icon="help-circle-outline" label="Help & Support" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            {signingOut ? (
              <View style={styles.settingRow}>
                <ActivityIndicator size="small" color={THEME.colors.error} />
                <Text style={[styles.settingLabel, { color: THEME.colors.error }]}>Signing out…</Text>
              </View>
            ) : (
              <SettingRow icon="log-out-outline" label="Sign Out" onPress={() => setShowSignOutModal(true)} danger />
            )}
          </View>
        </View>

        <Text style={styles.version}>Style Guru v1.0.0</Text>

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Sign Out Confirmation Modal */}
      <Modal visible={showSignOutModal} transparent animationType="fade" onRequestClose={() => setShowSignOutModal(false)}>
        <View style={styles.modalBackdrop}>
          <Animated.View entering={ZoomIn.springify()} style={styles.modalCard}>
            <View style={[styles.modalIconWrap, { backgroundColor: THEME.colors.accentDim }]}>
              <Ionicons name="log-out-outline" size={22} color={THEME.colors.error} />
            </View>
            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalText}>You'll need to sign in again to access your wardrobe.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowSignOutModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDangerBtn} onPress={handleSignOut}>
                <Text style={styles.modalDangerText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Edit Style Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <Animated.View entering={ZoomIn.springify()} style={[styles.modalCard, { maxWidth: 400 }]}>
            <View style={[styles.modalIconWrap, { backgroundColor: THEME.colors.primaryLight }]}>
              <Ionicons name="color-palette-outline" size={22} color={THEME.colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Edit Style Profile</Text>

            <View style={styles.editSection}>
              <Text style={styles.editLabel}>SKIN TONE</Text>
              <View style={styles.chipGrid}>
                {SKIN_TONES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, editSkinTone === t && styles.chipActive]}
                    onPress={() => setEditSkinTone(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, editSkinTone === t && styles.chipTextActive]}>
                      {capitalize(t)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.editSection}>
              <Text style={styles.editLabel}>BODY TYPE</Text>
              <View style={styles.chipGrid}>
                {BODY_TYPES.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, editBodyType === t && styles.chipActive]}
                    onPress={() => setEditBodyType(t)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, editBodyType === t && styles.chipTextActive]}>
                      {capitalize(t)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {editError ? <Text style={styles.editError}>{editError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowEditModal(false)} disabled={savingProfile}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProfile} disabled={savingProfile}>
                {savingProfile
                  ? <ActivityIndicator size="small" color={THEME.colors.white} />
                  : <Text style={styles.modalSaveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.colors.background },
  container: { padding: THEME.spacing.xl, gap: THEME.spacing.lg, paddingBottom: THEME.spacing.xxl },
  avatarSection: { alignItems: 'center', gap: THEME.spacing.sm + 2, paddingTop: THEME.spacing.md },
  avatarRing: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', ...THEME.shadow.glow },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' },
  email: { fontSize: THEME.fontSize.lg + 1, fontFamily: THEME.fonts.heading, color: THEME.colors.text },
  planBadge: { backgroundColor: THEME.colors.primaryLight, borderRadius: THEME.radius.full, paddingHorizontal: THEME.spacing.md - 2, paddingVertical: THEME.spacing.xs + 1, borderWidth: 1, borderColor: THEME.colors.borderAccent },
  planText: { fontSize: THEME.fontSize.caption, color: THEME.colors.primary, fontFamily: THEME.fonts.heading, letterSpacing: 1.2 },
  statsRow: { flexDirection: 'row', backgroundColor: THEME.colors.card, borderRadius: THEME.radius.lg, padding: THEME.spacing.lg, borderWidth: 1, borderColor: THEME.colors.border },
  statCard: { flex: 1, alignItems: 'center', gap: THEME.spacing.xs },
  statNumber: { fontSize: THEME.fontSize.title - 2, fontFamily: THEME.fonts.mono, color: THEME.colors.primary, letterSpacing: -1 },
  statLabel: { fontSize: THEME.fontSize.sm, color: THEME.colors.textTertiary, textAlign: 'center', fontFamily: THEME.fonts.headingMedium },
  statDivider: { width: 1, backgroundColor: THEME.colors.border, marginHorizontal: THEME.spacing.md },
  section: { gap: THEME.spacing.sm + 2 },
  sectionTitle: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, paddingLeft: THEME.spacing.xs },
  card: { backgroundColor: THEME.colors.card, borderRadius: THEME.radius.lg - 4, overflow: 'hidden', borderWidth: 1, borderColor: THEME.colors.border },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: THEME.spacing.xl, paddingVertical: THEME.spacing.md },
  profileLabel: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.body },
  profileValue: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.text },
  editProfileBtn: { paddingHorizontal: THEME.spacing.xl, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  editProfileText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.primary },
  divider: { height: 1, backgroundColor: THEME.colors.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: THEME.spacing.xl, paddingVertical: THEME.spacing.md, gap: THEME.spacing.md - 2 },
  settingLabel: { flex: 1, fontSize: THEME.fontSize.md, color: THEME.colors.text, fontFamily: THEME.fonts.headingMedium },
  version: { textAlign: 'center', fontSize: THEME.fontSize.sm, color: THEME.colors.textTertiary, letterSpacing: 0.5, fontFamily: THEME.fonts.body },

  // Modal shared
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: THEME.spacing.lg },
  modalCard: { width: '100%', maxWidth: 340, backgroundColor: THEME.colors.card, borderRadius: THEME.radius.lg, padding: THEME.spacing.lg - 2, alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.borderLight },
  modalIconWrap: { width: 52, height: 52, borderRadius: THEME.radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: THEME.spacing.md - 2 },
  modalTitle: { fontSize: THEME.fontSize.xl, fontFamily: THEME.fonts.display, color: THEME.colors.text, marginBottom: THEME.spacing.sm },
  modalText: { fontSize: THEME.fontSize.md, lineHeight: 20, color: THEME.colors.textSecondary, textAlign: 'center', marginBottom: THEME.spacing.xl, fontFamily: THEME.fonts.body },
  modalActions: { width: '100%', flexDirection: 'row', gap: THEME.spacing.sm + 2, marginTop: THEME.spacing.xl },
  modalCancelBtn: { flex: 1, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.surface, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  modalCancelText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.text },
  modalDangerBtn: { flex: 1, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.error, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  modalDangerText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.white },
  modalSaveBtn: { flex: 1, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.primary, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  modalSaveText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.white },

  // Edit profile modal
  editSection: { width: '100%', marginBottom: THEME.spacing.xs },
  editLabel: { fontSize: THEME.fontSize.xs, fontFamily: THEME.fonts.heading, color: THEME.colors.textTertiary, letterSpacing: 1, marginBottom: THEME.spacing.sm + 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: THEME.spacing.sm },
  chip: { paddingHorizontal: THEME.spacing.md, paddingVertical: THEME.spacing.sm + 2, borderRadius: THEME.radius.sm + 2, backgroundColor: THEME.colors.surface, borderWidth: 1, borderColor: THEME.colors.border },
  chipActive: { backgroundColor: THEME.colors.primaryLight, borderColor: THEME.colors.primary },
  chipText: { fontSize: THEME.fontSize.md - 1, fontFamily: THEME.fonts.headingMedium, color: THEME.colors.textTertiary },
  chipTextActive: { color: THEME.colors.primary },
  editError: { fontSize: THEME.fontSize.md - 1, color: THEME.colors.error, textAlign: 'center', marginTop: THEME.spacing.sm, fontFamily: THEME.fonts.body },
})
