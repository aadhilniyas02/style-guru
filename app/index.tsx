import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  FadeInLeft,
  FadeIn,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { THEME } from '../constants/theme'
import GoldGradientText from '../components/GoldGradientText'
import ShimmerButton from '../components/ShimmerButton'
import AnimatedPressable from '../components/AnimatedPressable'

export default function OnboardingScreen() {
  const router = useRouter()

  // Floating orb animations
  const orb1X = useSharedValue(0)
  const orb1Y = useSharedValue(0)
  const orb2X = useSharedValue(0)
  const orb2Y = useSharedValue(0)
  const orb3X = useSharedValue(0)
  const orb3Y = useSharedValue(0)

  useEffect(() => {
    orb1X.value = withRepeat(withTiming(30, { duration: 6000, easing: Easing.inOut(Easing.ease) }), -1, true)
    orb1Y.value = withRepeat(withTiming(-20, { duration: 8000, easing: Easing.inOut(Easing.ease) }), -1, true)
    orb2X.value = withRepeat(withTiming(-25, { duration: 7000, easing: Easing.inOut(Easing.ease) }), -1, true)
    orb2Y.value = withRepeat(withTiming(30, { duration: 5000, easing: Easing.inOut(Easing.ease) }), -1, true)
    orb3X.value = withRepeat(withTiming(20, { duration: 9000, easing: Easing.inOut(Easing.ease) }), -1, true)
    orb3Y.value = withRepeat(withTiming(-15, { duration: 6500, easing: Easing.inOut(Easing.ease) }), -1, true)
  }, [])

  const orbStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
  }))
  const orbStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
  }))
  const orbStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateX: orb3X.value }, { translateY: orb3Y.value }],
  }))

  const FEATURES = [
    { icon: 'camera-outline' as const, text: 'Photograph your wardrobe' },
    { icon: 'scan-outline' as const, text: 'AI identifies each item' },
    { icon: 'sparkles-outline' as const, text: 'Smart outfit suggestions' },
  ]

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Animated ambient orbs */}
      <Animated.View style={[styles.orbGold, orbStyle1]} />
      <Animated.View style={[styles.orbCoral, orbStyle2]} />
      <Animated.View style={[styles.orbTeal, orbStyle3]} />

      {/* Logo */}
      <Animated.View entering={FadeIn.duration(800)} style={styles.logoArea}>
        <LinearGradient
          colors={[THEME.colors.gradientStart, THEME.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoBg}
        >
          <Ionicons name="shirt" size={36} color={THEME.colors.white} />
        </LinearGradient>
        <View style={styles.logoGlow} />
      </Animated.View>

      {/* Headline */}
      <Animated.View entering={FadeIn.delay(200).duration(800)} style={styles.headline}>
        <GoldGradientText
          text="Style Guru"
          style={styles.appName}
        />
        <Text style={styles.tagline}>Your AI Personal Stylist</Text>
      </Animated.View>

      {/* Feature pills */}
      <View style={styles.features}>
        {FEATURES.map((f, i) => (
          <Animated.View
            key={i}
            entering={FadeInLeft.delay(400 + i * 150).duration(500)}
          >
            <View style={styles.featurePill}>
              <View style={styles.featureAccent} />
              <View style={styles.featureIconBg}>
                <Ionicons name={f.icon} size={20} color={THEME.colors.primary} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* CTA */}
      <Animated.View entering={FadeIn.delay(900).duration(600)} style={styles.cta}>
        <ShimmerButton onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.btnAccentText}>Get Started Free</Text>
        </ShimmerButton>

        <AnimatedPressable onPress={() => router.push('/(auth)/login')}>
          <View style={styles.btnGhost}>
            <Text style={styles.btnGhostText}>I have an account</Text>
          </View>
        </AnimatedPressable>
      </Animated.View>

      <Text style={styles.madeFor}>BUILT FOR SRI LANKANS</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: 80,
    paddingBottom: THEME.spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Floating orbs — use % to stay within container bounds
  orbGold: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: THEME.colors.primaryGlow,
    top: -120,
    alignSelf: 'center',
    opacity: 0.4,
  },
  orbCoral: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: THEME.colors.accentDim,
    bottom: -40,
    right: -40,
    opacity: 0.6,
  },
  orbTeal: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.colors.secondaryLight,
    top: '40%',
    left: -50,
    opacity: 0.5,
  },
  // Logo
  logoArea: { marginBottom: THEME.spacing.sm, alignItems: 'center' },
  logoBg: {
    width: 76,
    height: 76,
    borderRadius: THEME.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.glow,
  },
  logoGlow: {
    position: 'absolute',
    bottom: -8,
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: THEME.colors.primaryGlow,
    opacity: 0.5,
  },
  // Headline
  headline: { alignItems: 'center', marginBottom: THEME.spacing.md },
  appName: {
    fontSize: THEME.fontSize.hero,
    fontFamily: THEME.fonts.display,
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: THEME.fontSize.lg,
    color: THEME.colors.textTertiary,
    marginTop: THEME.spacing.xs,
    fontFamily: THEME.fonts.bodyMedium,
  },
  // Features
  features: {
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
    width: '100%',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingVertical: THEME.spacing.sm + 2,
    paddingHorizontal: THEME.spacing.md,
    overflow: 'hidden',
  },
  featureAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: THEME.colors.primary,
    borderRadius: 2,
  },
  featureIconBg: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: THEME.fontSize.md + 1,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fonts.headingMedium,
    flex: 1,
  },
  // CTA
  cta: {
    gap: THEME.spacing.sm + 2,
    width: '100%',
  },
  btnAccentText: {
    color: THEME.colors.white,
    fontSize: THEME.fontSize.lg + 1,
    fontFamily: THEME.fonts.heading,
    letterSpacing: 0.4,
  },
  btnGhost: {
    borderRadius: THEME.radius.full,
    paddingVertical: THEME.spacing.md - 2,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.borderLight,
  },
  btnGhostText: {
    color: THEME.colors.textSecondary,
    fontSize: THEME.fontSize.lg,
    fontFamily: THEME.fonts.headingMedium,
  },
  madeFor: {
    color: THEME.colors.textTertiary,
    fontSize: THEME.fontSize.caption,
    marginTop: THEME.spacing.sm + 2,
    letterSpacing: 2,
    fontFamily: THEME.fonts.body,
  },
})
