import { View, Text, StyleSheet, Platform } from 'react-native'
import { useState, useEffect } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { getWeather } from '../lib/weather'
import { THEME } from '../constants/theme'

export default function WeatherBadge() {
  const [temp, setTemp] = useState<number | null>(null)
  const wobble = useSharedValue(0)

  useEffect(() => {
    getWeather()
      .then(w => setTemp(w.temp))
      .catch(() => setTemp(31))
  }, [])

  useEffect(() => {
    wobble.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    )
  }, [])

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wobble.value}deg` }],
  }))

  if (temp === null) return null

  const inner = (
    <View style={styles.content}>
      <Animated.View style={iconStyle}>
        <Ionicons name="partly-sunny" size={18} color={THEME.colors.warning} />
      </Animated.View>
      <Text style={styles.temp}>{temp}°</Text>
      <Text style={styles.city}>Colombo</Text>
    </View>
  )

  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={40} tint="dark" style={styles.badge}>
        {inner}
      </BlurView>
    )
  }

  return (
    <View style={[styles.badge, styles.fallback]}>
      {inner}
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    alignSelf: 'flex-start',
    marginTop: THEME.spacing.sm + 4,
  },
  fallback: {
    backgroundColor: THEME.colors.glass,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.md,
  },
  temp: {
    fontSize: THEME.fontSize.lg,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.text,
  },
  city: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textTertiary,
    fontFamily: THEME.fonts.body,
  },
})
