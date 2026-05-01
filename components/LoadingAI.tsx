import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated'
import { useEffect, useState } from 'react'
import { THEME } from '../constants/theme'

const MESSAGES = [
  'Analyzing color harmony...',
  'Checking weather compatibility...',
  'Matching formality levels...',
  'Finding your best combinations...',
  'Almost there...',
]

interface Props {
  visible: boolean
}

export default function LoadingAI({ visible }: Props) {
  const progressWidth = useSharedValue(0)
  const pulse = useSharedValue(1)
  const orb1Angle = useSharedValue(0)
  const orb2Angle = useSharedValue(0)
  const orb3Angle = useSharedValue(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const messageFade = useSharedValue(1)

  useEffect(() => {
    if (!visible) {
      progressWidth.value = 0
      setMessageIndex(0)
      return
    }

    // Progress bar animation
    progressWidth.value = withTiming(0.9, { duration: 10000, easing: Easing.out(Easing.ease) })

    // Card pulse
    pulse.value = withRepeat(
      withSequence(
        withTiming(0.97, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )

    // Orbiting particles
    orb1Angle.value = withRepeat(withTiming(360, { duration: 3000, easing: Easing.linear }), -1, false)
    orb2Angle.value = withDelay(500, withRepeat(withTiming(360, { duration: 4000, easing: Easing.linear }), -1, false))
    orb3Angle.value = withDelay(1000, withRepeat(withTiming(360, { duration: 3500, easing: Easing.linear }), -1, false))

    // Cycling messages
    const interval = setInterval(() => {
      messageFade.value = withSequence(
        withTiming(0, { duration: 200 }),
        withTiming(1, { duration: 200 })
      )
      setMessageIndex(prev => (prev + 1) % MESSAGES.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [visible])

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%` as any,
  }))

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }))

  const messageStyle = useAnimatedStyle(() => ({
    opacity: messageFade.value,
  }))

  const makeOrbStyle = (angleVal: Animated.SharedValue<number>, radius: number) =>
    useAnimatedStyle(() => {
      const rad = (angleVal.value * Math.PI) / 180
      return {
        transform: [
          { translateX: Math.cos(rad) * radius },
          { translateY: Math.sin(rad) * radius },
        ],
      }
    })

  const orb1Style = makeOrbStyle(orb1Angle, 24)
  const orb2Style = makeOrbStyle(orb2Angle, 18)
  const orb3Style = makeOrbStyle(orb3Angle, 21)

  if (!visible) return null

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Animated.View style={[styles.card, pulseStyle]}>
        {/* Orbiting particles */}
        <View style={styles.orbContainer}>
          <Animated.View style={[styles.orb, styles.orb1, orb1Style]} />
          <Animated.View style={[styles.orb, styles.orb2, orb2Style]} />
          <Animated.View style={[styles.orb, styles.orb3, orb3Style]} />
          <Ionicons name="sparkles" size={24} color={THEME.colors.primary} />
        </View>

        <Text style={styles.title}>AI is styling your look</Text>

        <Animated.View style={messageStyle}>
          <Text style={styles.subtitle}>{MESSAGES[messageIndex]}</Text>
        </Animated.View>

        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: THEME.spacing.xl, paddingVertical: THEME.spacing.md },
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.sm + 4,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    alignItems: 'center',
    ...THEME.shadow.glow,
  },
  orbContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  orb1: { backgroundColor: THEME.colors.primary },
  orb2: { backgroundColor: THEME.colors.accent },
  orb3: { backgroundColor: THEME.colors.secondary },
  title: {
    fontSize: THEME.fontSize.xl,
    fontFamily: THEME.fonts.display,
    color: THEME.colors.text,
  },
  subtitle: {
    fontSize: THEME.fontSize.md,
    color: THEME.colors.textTertiary,
    fontFamily: THEME.fonts.bodyMedium,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: THEME.colors.surface,
    borderRadius: 2,
    marginTop: THEME.spacing.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary,
    borderRadius: 2,
  },
})
