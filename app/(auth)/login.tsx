import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal,
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated'
import { useAuth } from '../../hooks/useAuth'
import { THEME } from '../../constants/theme'
import ShimmerButton from '../../components/ShimmerButton'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [showResetModal, setShowResetModal] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const [loginError, setLoginError] = useState<string | null>(null)

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setLoginError(null)
    try {
      await signIn(email.trim(), password)
    } catch (err: any) {
      setLoginError(err.message || 'Sign in failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  function openResetModal() {
    setResetEmail(email.trim())
    setResetError(null)
    setResetSent(false)
    setShowResetModal(true)
  }

  async function handleResetPassword() {
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.')
      return
    }
    setResetLoading(true)
    setResetError(null)
    try {
      await resetPassword(resetEmail.trim())
      setResetSent(true)
    } catch (err: any) {
      setResetError(err.message || 'Could not send reset email. Please try again.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={styles.iconBg}><Ionicons name="shirt" size={32} color={THEME.colors.primary} /></View>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your Style Guru account</Text>
        </Animated.View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={THEME.colors.textTertiary} value={email} onChangeText={t => { setEmail(t); setLoginError(null) }} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={{ position: 'relative' }}>
              <TextInput style={[styles.input, { paddingRight: 52 }]} placeholder="Enter your password" placeholderTextColor={THEME.colors.textTertiary} value={password} onChangeText={t => { setPassword(t); setLoginError(null) }} secureTextEntry={!showPassword} autoComplete="password" />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={THEME.colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>

          {loginError ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={16} color={THEME.colors.error} />
              <Text style={styles.errorText}>{loginError}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={{ alignSelf: 'flex-end' }} onPress={openResetModal}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <ShimmerButton onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={THEME.colors.white} /> : <Text style={styles.btnText}>Sign In</Text>}
          </ShimmerButton>
        </View>

        <View style={styles.dividerRow}><View style={styles.dividerLine} /><Text style={styles.dividerText}>or</Text><View style={styles.dividerLine} /></View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')}><Text style={styles.footerLink}>Sign Up</Text></TouchableOpacity>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal visible={showResetModal} transparent animationType="fade" onRequestClose={() => setShowResetModal(false)}>
        <View style={styles.modalBackdrop}>
          <Animated.View entering={ZoomIn.springify()} style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons name="lock-open-outline" size={22} color={THEME.colors.primary} />
            </View>
            <Text style={styles.modalTitle}>Reset Password</Text>

            {resetSent ? (
              <>
                <View style={styles.successRow}>
                  <Ionicons name="checkmark-circle" size={20} color={THEME.colors.secondary} />
                  <Text style={styles.successText}>Reset link sent! Check your email.</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowResetModal(false)}>
                  <Text style={styles.modalCloseBtnText}>Done</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtext}>Enter your email and we'll send a reset link.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="you@example.com"
                  placeholderTextColor={THEME.colors.textTertiary}
                  value={resetEmail}
                  onChangeText={t => { setResetEmail(t); setResetError(null) }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
                {resetError ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="warning-outline" size={16} color={THEME.colors.error} />
                    <Text style={styles.errorText}>{resetError}</Text>
                  </View>
                ) : null}
                <View style={styles.modalActions}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowResetModal(false)} disabled={resetLoading}>
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.modalSendBtn} onPress={handleResetPassword} disabled={resetLoading}>
                    {resetLoading
                      ? <ActivityIndicator size="small" color={THEME.colors.white} />
                      : <Text style={styles.modalSendText}>Send Link</Text>}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: THEME.colors.background },
  container: { flexGrow: 1, padding: THEME.spacing.lg, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: THEME.spacing.xl + 4 },
  iconBg: { width: 64, height: 64, borderRadius: THEME.radius.lg - 4, backgroundColor: THEME.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: THEME.spacing.md },
  title: { fontSize: THEME.fontSize.xxl + 2, fontFamily: THEME.fonts.display, color: THEME.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, marginTop: THEME.spacing.xs + 2, fontFamily: THEME.fonts.body },
  form: { gap: THEME.spacing.lg - 6 },
  inputGroup: { gap: THEME.spacing.xs + 2 },
  label: { fontSize: THEME.fontSize.md - 1, fontFamily: THEME.fonts.headingMedium, color: THEME.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { borderWidth: 1, borderColor: THEME.colors.borderLight, borderRadius: THEME.radius.md, paddingHorizontal: THEME.spacing.md, paddingVertical: THEME.spacing.md - 2, fontSize: THEME.fontSize.lg, color: THEME.colors.text, backgroundColor: THEME.colors.card, fontFamily: THEME.fonts.body },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  forgotText: { fontSize: THEME.fontSize.md, color: THEME.colors.primary, fontFamily: THEME.fonts.headingMedium },
  btnText: { color: THEME.colors.white, fontSize: THEME.fontSize.lg + 1, fontFamily: THEME.fonts.heading },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: THEME.spacing.sm, backgroundColor: THEME.colors.accentDim, borderRadius: THEME.radius.sm + 2, borderWidth: 1, borderColor: 'rgba(224,122,95,0.2)', padding: THEME.spacing.sm + 4 },
  errorText: { flex: 1, fontSize: THEME.fontSize.md - 1, color: THEME.colors.error, fontFamily: THEME.fonts.bodyMedium },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: THEME.spacing.xl - 4, gap: THEME.spacing.sm + 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: THEME.colors.border },
  dividerText: { color: THEME.colors.textTertiary, fontSize: THEME.fontSize.sm, fontFamily: THEME.fonts.body },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.body },
  footerLink: { fontSize: THEME.fontSize.md, color: THEME.colors.primary, fontFamily: THEME.fonts.heading },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: THEME.spacing.lg },
  modalCard: { width: '100%', maxWidth: 360, backgroundColor: THEME.colors.card, borderRadius: THEME.radius.lg, padding: THEME.spacing.lg - 2, alignItems: 'center', borderWidth: 1, borderColor: THEME.colors.borderLight },
  modalIconWrap: { width: 52, height: 52, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: THEME.spacing.md - 2 },
  modalTitle: { fontSize: THEME.fontSize.xl, fontFamily: THEME.fonts.display, color: THEME.colors.text, marginBottom: THEME.spacing.xs + 2 },
  modalSubtext: { fontSize: THEME.fontSize.md, color: THEME.colors.textSecondary, textAlign: 'center', marginBottom: THEME.spacing.md, lineHeight: 20, fontFamily: THEME.fonts.body },
  modalInput: { width: '100%', borderWidth: 1, borderColor: THEME.colors.borderLight, borderRadius: THEME.radius.md, paddingHorizontal: THEME.spacing.md, paddingVertical: THEME.spacing.md - 2, fontSize: THEME.fontSize.lg, color: THEME.colors.text, backgroundColor: THEME.colors.surface, marginBottom: THEME.spacing.sm + 4, fontFamily: THEME.fonts.body },
  modalActions: { width: '100%', flexDirection: 'row', gap: THEME.spacing.sm + 2, marginTop: THEME.spacing.sm },
  modalCancelBtn: { flex: 1, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.surface, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  modalCancelText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.text },
  modalSendBtn: { flex: 1, borderRadius: THEME.radius.md, backgroundColor: THEME.colors.primary, paddingVertical: THEME.spacing.md - 2, alignItems: 'center' },
  modalSendText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.white },
  modalCloseBtn: { width: '100%', borderRadius: THEME.radius.md, backgroundColor: THEME.colors.primary, paddingVertical: THEME.spacing.md - 2, alignItems: 'center', marginTop: THEME.spacing.md },
  modalCloseBtnText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.white },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: THEME.spacing.sm, marginBottom: THEME.spacing.sm },
  successText: { fontSize: THEME.fontSize.md, color: THEME.colors.secondary, fontFamily: THEME.fonts.headingMedium },
})
