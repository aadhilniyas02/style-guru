import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated'
import { useAuth } from '../../hooks/useAuth'
import { THEME } from '../../constants/theme'
import ShimmerButton from '../../components/ShimmerButton'

const SKIN_TONES = ['fair', 'medium', 'tan', 'dark'] as const
const BODY_TYPES = ['slim', 'average', 'athletic', 'broad'] as const

const SKIN_COLORS: Record<string, string> = {
  fair: '#F5DEB3',
  medium: '#C8A882',
  tan: '#A67B5B',
  dark: '#6B4226',
}

export default function RegisterScreen() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [skinTone, setSkinTone] = useState('')
  const [bodyType, setBodyType] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    if (!skinTone || !bodyType) { Alert.alert('Select Both', 'Please pick your skin tone and body type.'); return }
    setLoading(true)
    try {
      await signUp(email.trim(), password, skinTone, bodyType)
      Alert.alert(
        'Account Created!',
        'Your account has been created. Please sign in with your credentials.',
        [{ text: 'Sign In', onPress: () => router.replace('/(auth)/login') }]
      )
    }
    catch (err: any) { Alert.alert('Registration Failed', err.message || 'Something went wrong.') }
    finally { setLoading(false) }
  }

  function handleNext() {
    if (!email.trim() || !password.trim()) { Alert.alert('Missing Fields', 'Please fill in all fields.'); return }
    if (password.length < 6) { Alert.alert('Weak Password', 'Password must be at least 6 characters.'); return }
    setStep(2)
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          <View style={styles.iconBg}><Ionicons name="person-add" size={30} color={THEME.colors.primary} /></View>
          <Text style={styles.title}>{step === 1 ? 'Create Account' : 'Your Style Profile'}</Text>
          <Text style={styles.subtitle}>{step === 1 ? 'Join Style Guru and level up your look' : 'Help our AI pick outfits for you'}</Text>
        </Animated.View>

        {/* Step indicator with animated gold fill */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={styles.stepLineOuter}>
            <Animated.View style={[styles.stepLineFill, step === 2 && styles.stepLineFillActive]} />
          </View>
          <View style={[styles.stepDot, step === 2 && styles.stepActive]} />
        </View>

        {step === 1 ? (
          <Animated.View key="step1" entering={SlideInRight.duration(300)} exiting={SlideOutLeft.duration(300)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={THEME.colors.textTertiary} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput style={[styles.input, { paddingRight: 52 }]} placeholder="Min 6 characters" placeholderTextColor={THEME.colors.textTertiary} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="new-password" />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={THEME.colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
            <ShimmerButton onPress={handleNext}>
              <Text style={styles.btnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={THEME.colors.white} />
            </ShimmerButton>
          </Animated.View>
        ) : (
          <Animated.View key="step2" entering={SlideInRight.duration(300)} style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skin Tone</Text>
              <View style={styles.chipGrid}>
                {SKIN_TONES.map(t => (
                  <TouchableOpacity key={t} style={[styles.chip, skinTone === t && styles.chipActive]} onPress={() => setSkinTone(t)} activeOpacity={0.8}>
                    <View style={[styles.skinSwatch, { backgroundColor: SKIN_COLORS[t] }]} />
                    <Text style={[styles.chipText, skinTone === t && styles.chipTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Body Type</Text>
              <View style={styles.chipGrid}>
                {BODY_TYPES.map(t => (
                  <TouchableOpacity key={t} style={[styles.chip, bodyType === t && styles.chipActive]} onPress={() => setBodyType(t)} activeOpacity={0.8}>
                    <Text style={[styles.chipText, bodyType === t && styles.chipTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Ionicons name="arrow-back" size={18} color={THEME.colors.textSecondary} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <ShimmerButton onPress={handleRegister} disabled={loading}>
                  {loading ? <ActivityIndicator color={THEME.colors.white} /> : <Text style={styles.btnText}>Create Account</Text>}
                </ShimmerButton>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}><Text style={styles.footerLink}>Sign In</Text></TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: THEME.colors.background },
  container: { flexGrow: 1, padding: THEME.spacing.lg, paddingTop: 80 },
  header: { alignItems: 'center', marginBottom: THEME.spacing.lg },
  iconBg: { width: 64, height: 64, borderRadius: THEME.radius.lg - 4, backgroundColor: THEME.colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: THEME.spacing.md },
  title: { fontSize: THEME.fontSize.xxl, fontFamily: THEME.fonts.display, color: THEME.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, marginTop: THEME.spacing.xs + 2, fontFamily: THEME.fonts.body },
  stepRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: THEME.spacing.xl - 4 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: THEME.colors.surfaceLight, borderWidth: 2, borderColor: THEME.colors.surfaceLight },
  stepActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  stepLineOuter: { width: 48, height: 2, backgroundColor: THEME.colors.surfaceLight, overflow: 'hidden' },
  stepLineFill: { width: 0, height: '100%', backgroundColor: THEME.colors.primary },
  stepLineFillActive: { width: '100%' },
  form: { gap: THEME.spacing.xl },
  inputGroup: { gap: THEME.spacing.sm },
  label: { fontSize: THEME.fontSize.md - 1, fontFamily: THEME.fonts.headingMedium, color: THEME.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { borderWidth: 1, borderColor: THEME.colors.borderLight, borderRadius: THEME.radius.md, paddingHorizontal: THEME.spacing.md, paddingVertical: THEME.spacing.md - 2, fontSize: THEME.fontSize.lg, color: THEME.colors.text, backgroundColor: THEME.colors.card, fontFamily: THEME.fonts.body },
  eyeBtn: { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: THEME.spacing.sm + 2 },
  chip: { paddingHorizontal: THEME.spacing.xl, paddingVertical: THEME.spacing.sm + 4, borderRadius: THEME.radius.sm + 4, backgroundColor: THEME.colors.card, borderWidth: 1, borderColor: THEME.colors.border, flexDirection: 'row', alignItems: 'center', gap: THEME.spacing.sm },
  chipActive: { backgroundColor: THEME.colors.primaryLight, borderColor: THEME.colors.primary },
  chipText: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.headingMedium, color: THEME.colors.textTertiary },
  chipTextActive: { color: THEME.colors.primary },
  skinSwatch: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  btnText: { color: THEME.colors.white, fontSize: THEME.fontSize.lg + 1, fontFamily: THEME.fonts.heading },
  btnRow: { flexDirection: 'row', gap: THEME.spacing.sm + 4, alignItems: 'center' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: THEME.spacing.xs + 2, paddingVertical: THEME.spacing.md, paddingHorizontal: THEME.spacing.sm },
  backBtnText: { color: THEME.colors.textSecondary, fontSize: THEME.fontSize.md + 1, fontFamily: THEME.fonts.headingMedium },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: THEME.spacing.xl - 4 },
  footerText: { fontSize: THEME.fontSize.md, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.body },
  footerLink: { fontSize: THEME.fontSize.md, color: THEME.colors.primary, fontFamily: THEME.fonts.heading },
})
