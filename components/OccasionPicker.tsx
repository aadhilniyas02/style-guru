import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import { OCCASIONS } from '../constants/occasions'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated'
import { THEME } from '../constants/theme'

interface Props {
  selected: string | null
  onSelect: (id: string) => void
}

function OccasionChip({ item, active, onSelect }: { item: typeof OCCASIONS[0]; active: boolean; onSelect: () => void }) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePress = () => {
    scale.value = withSpring(1.06, THEME.animation.springBouncy)
    setTimeout(() => { scale.value = withSpring(1, THEME.animation.spring) }, 150)
    onSelect()
  }

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.chip, active && styles.chipActive]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBg, active && styles.iconBgActive]}>
          <Ionicons name={item.icon as any} size={20} color={active ? THEME.colors.black : THEME.colors.textTertiary} />
        </View>
        <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{item.label}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function OccasionPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>OCCASION</Text>
      <FlatList
        data={OCCASIONS}
        keyExtractor={i => i.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <OccasionChip
            item={item}
            active={selected === item.id}
            onSelect={() => onSelect(item.id)}
          />
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: THEME.spacing.sm + 2, paddingVertical: THEME.spacing.sm },
  sectionLabel: {
    fontSize: THEME.fontSize.sm,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.textTertiary,
    letterSpacing: 1.5,
    paddingHorizontal: THEME.spacing.xl,
  },
  list: { paddingHorizontal: THEME.spacing.xl, gap: THEME.spacing.sm },
  chip: {
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.md,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    minWidth: 90,
  },
  chipActive: {
    backgroundColor: THEME.colors.primaryLight,
    borderColor: THEME.colors.primary,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: THEME.spacing.sm + 2,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgActive: {
    backgroundColor: THEME.colors.primary,
  },
  chipLabel: {
    fontSize: THEME.fontSize.sm,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.textTertiary,
  },
  chipLabelActive: { color: THEME.colors.primary },
})
