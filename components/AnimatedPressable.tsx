import { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { THEME } from '../constants/theme'

interface Props {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  scaleTo?: number
}

export default function AnimatedPressable({
  children,
  style,
  onPress,
  onLongPress,
  disabled,
  scaleTo = 0.96,
}: Props) {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Animated.View
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {/* Use a Pressable-like approach via touchable */}
        <Animated.View
          onTouchStart={() => {
            if (!disabled) scale.value = withSpring(scaleTo, THEME.animation.spring)
          }}
          onTouchEnd={() => {
            scale.value = withSpring(1, THEME.animation.spring)
            if (!disabled && onPress) onPress()
          }}
          onTouchCancel={() => {
            scale.value = withSpring(1, THEME.animation.spring)
          }}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  )
}
