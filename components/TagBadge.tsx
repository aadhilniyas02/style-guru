import { View, Text, StyleSheet } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { THEME } from '../constants/theme'

interface Props {
  label: string
  color?: string
}

export default function TagBadge({ label, color }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <View style={[styles.badge, color ? { borderColor: color + '40', backgroundColor: color + '15' } : null]}>
        <Text style={[styles.text, color ? { color } : null]}>{label}</Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: THEME.spacing.sm + 2,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
  },
  text: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.primary,
  },
})
