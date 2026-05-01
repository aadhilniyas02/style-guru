import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { useEffect } from 'react'
import { THEME } from '../constants/theme'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'

type IoniconsName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: { active: IoniconsName; inactive: IoniconsName }[] = [
  { active: 'sparkles', inactive: 'sparkles-outline' },
  { active: 'grid', inactive: 'grid-outline' },
  { active: 'add-circle', inactive: 'add-circle-outline' },
  { active: 'person', inactive: 'person-outline' },
]

const TAB_WIDTH = 64

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()
  const indicatorX = useSharedValue(state.index * TAB_WIDTH)

  useEffect(() => {
    indicatorX.value = withSpring(state.index * TAB_WIDTH, THEME.animation.spring)
  }, [state.index])

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }))

  const bottomPadding = Math.max(insets.bottom, 12)

  const inner = (
    <View style={styles.innerRow}>
      {/* Animated gold indicator */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {state.routes.map((route, index) => {
        const isFocused = state.index === index
        const isAddTab = index === 2
        const icons = TAB_ICONS[index]

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          })
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        if (isAddTab) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.8}
              style={styles.tabBtn}
            >
              <LinearGradient
                colors={[THEME.colors.gradientStart, THEME.colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addCircle}
              >
                <Ionicons name="add" size={26} color={THEME.colors.black} />
              </LinearGradient>
            </TouchableOpacity>
          )
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.tabBtn}
          >
            <Ionicons
              name={isFocused ? icons.active : icons.inactive}
              size={22}
              color={isFocused ? THEME.colors.primary : THEME.colors.textTertiary}
            />
          </TouchableOpacity>
        )
      })}
    </View>
  )

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={50} tint="dark" style={styles.bar}>
          {inner}
        </BlurView>
      ) : (
        <View style={[styles.bar, styles.barFallback]}>
          {inner}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  bar: {
    borderRadius: THEME.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.borderLight,
    ...THEME.shadow.elevated,
  },
  barFallback: {
    backgroundColor: THEME.colors.glass,
  },
  innerRow: {
    flexDirection: 'row',
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.sm,
  },
  tabBtn: {
    width: TAB_WIDTH,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadow.glow,
  },
  indicator: {
    position: 'absolute',
    width: TAB_WIDTH,
    height: 48,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.primaryLight,
    top: THEME.spacing.sm,
    left: THEME.spacing.sm,
  },
})
