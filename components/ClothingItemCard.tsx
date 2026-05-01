import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated'
import type { WardrobeItem } from '../app/(tabs)/wardrobe'
import { formatClothingLabel } from '../constants/clothing'
import { THEME } from '../constants/theme'

interface Props {
  item: WardrobeItem
  onDelete?: (id: string) => void
  index?: number
}

export default function ClothingItemCard({ item, onDelete, index = 0 }: Props) {
  const scale = useSharedValue(1)

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.97, THEME.animation.spring)
  }
  const handlePressOut = () => {
    scale.value = withSpring(1, THEME.animation.spring)
  }

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 60).duration(400)}
      style={animStyle}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.photo_url }} style={styles.image} />
          {/* Bottom gradient overlay for text readability */}
          <LinearGradient
            colors={['transparent', THEME.colors.card]}
            style={styles.imageGradient}
          />
        </View>
        {onDelete && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
            <Ionicons name="close-circle" size={24} color={THEME.colors.error} />
          </TouchableOpacity>
        )}
        <View style={styles.info}>
          <Text style={styles.type}>{formatClothingLabel(item.specific_label ?? item.clothing_type)}</Text>
          <Text style={styles.meta}>{formatClothingLabel(item.primary_category ?? item.clothing_type)} · {item.formality}</Text>
          {item.tags.length > 0 && (
            <View style={styles.tagsRow}>
              {item.tags.slice(0, 3).map((tag, i) => (
                <View key={i} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: { borderRadius: THEME.radius.lg - 4, backgroundColor: THEME.colors.card, overflow: 'hidden', borderWidth: 1, borderColor: THEME.colors.border },
  imageContainer: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1, backgroundColor: THEME.colors.surface },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
  deleteBtn: { position: 'absolute', top: THEME.spacing.sm, right: THEME.spacing.sm, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: THEME.radius.sm + 4, padding: 2 },
  info: { padding: THEME.spacing.sm + 4, gap: THEME.spacing.xs },
  type: { fontSize: THEME.fontSize.md, fontFamily: THEME.fonts.heading, color: THEME.colors.text, textTransform: 'capitalize' },
  meta: { fontSize: THEME.fontSize.xs, color: THEME.colors.textTertiary, fontFamily: THEME.fonts.body },
  tagsRow: { flexDirection: 'row', gap: THEME.spacing.xs + 2, marginTop: THEME.spacing.xs, flexWrap: 'wrap' },
  tagPill: { backgroundColor: THEME.colors.surface, borderRadius: THEME.radius.sm, paddingHorizontal: THEME.spacing.sm, paddingVertical: 3, borderWidth: 1, borderColor: THEME.colors.border },
  tagText: { fontSize: THEME.fontSize.caption, color: THEME.colors.textSecondary, fontFamily: THEME.fonts.bodyMedium },
})
