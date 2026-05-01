import { ReactNode } from 'react'
import { Text, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { THEME } from '../constants/theme'
import AnimatedPressable from './AnimatedPressable'

interface Props {
  onPress: () => void
  disabled?: boolean
  children: ReactNode
  colors?: string[]
  style?: StyleProp<ViewStyle>
}

export default function ShimmerButton({
  onPress,
  disabled,
  children,
  colors = [THEME.colors.gradientStart, THEME.colors.gradientEnd],
  style,
}: Props) {
  const shimmerX = useSharedValue(-1)

  useEffect(() => {
    if (!disabled) {
      shimmerX.value = withDelay(
        1000,
        withRepeat(
          withTiming(2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          -1,
          false
        )
      )
    }
  }, [disabled])

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value * 200 }],
  }))

  return (
    <AnimatedPressable onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={disabled ? [THEME.colors.surface, THEME.colors.surface] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.btn, disabled && styles.disabled, style]}
      >
        {children}
        {!disabled && (
          <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.15)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        )}
      </LinearGradient>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: THEME.radius.full,
    paddingVertical: THEME.spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    left: -80,
  },
  shimmerGradient: {
    flex: 1,
  },
})
