import { ReactNode } from 'react'
import { View, StyleSheet, Platform, StyleProp, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'
import { THEME } from '../constants/theme'

interface Props {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  intensity?: number
}

export default function GlassCard({ children, style, intensity = 40 }: Props) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint="dark" style={[styles.card, style]}>
        <View style={styles.inner}>{children}</View>
      </BlurView>
    )
  }

  // Android / Web fallback — semi-transparent background
  return (
    <View style={[styles.card, styles.fallback, style]}>
      <View style={styles.inner}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: THEME.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  fallback: {
    backgroundColor: THEME.colors.glass,
  },
  inner: {
    padding: THEME.spacing.md,
  },
})
