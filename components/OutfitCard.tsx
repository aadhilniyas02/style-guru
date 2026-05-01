import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeInDown,
} from 'react-native-reanimated'
import { formatClothingLabel } from '../constants/clothing'
import { THEME } from '../constants/theme'

interface OutfitItem {
  id: string
  photo_url: string
  clothing_type: string
  specific_label?: string | null
}

interface Props {
  outfit: {
    items: OutfitItem[]
    explanation: string
  }
  index: number
}

export default function OutfitCard({ outfit, index }: Props) {
  const outfitItems = outfit.items ?? []
  const heartScale = useSharedValue(1)

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }))

  const handleLike = () => {
    heartScale.value = withSequence(
      withSpring(1.4, THEME.animation.springBouncy),
      withSpring(1, THEME.animation.spring)
    )
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 200).springify()}>
      <View style={styles.card}>
        {/* Gold accent line at top */}
        <LinearGradient
          colors={[THEME.colors.gradientStart, THEME.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topAccent}
        />

        <View style={styles.header}>
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>
          <Text style={styles.title}>Outfit {index + 1}</Text>
          <View style={styles.feedbackRow}>
            <TouchableOpacity style={styles.feedbackBtn} onPress={handleLike} activeOpacity={0.7}>
              <Animated.View style={heartStyle}>
                <Ionicons name="heart-outline" size={18} color={THEME.colors.secondary} />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.7}>
              <Ionicons name="thumbs-down-outline" size={18} color={THEME.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Slightly overlapping item images */}
        <View style={styles.itemsRow}>
          {outfitItems.map((item, i) => (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                i > 0 && { marginLeft: -8 },
                { zIndex: outfitItems.length - i },
              ]}
            >
              <Image source={{ uri: item.photo_url }} style={styles.itemImg} />
              <Text style={styles.itemType}>
                {formatClothingLabel(item.specific_label ?? item.clothing_type)}
              </Text>
            </View>
          ))}
        </View>

        {/* Explanation as quote with gold border */}
        {outfit.explanation ? (
          <View style={styles.explanationRow}>
            <View style={styles.quoteBorder} />
            <View style={styles.explanationContent}>
              <Ionicons name="bulb-outline" size={14} color={THEME.colors.primary} />
              <Text style={styles.explanation}>{outfit.explanation}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    padding: THEME.spacing.lg - 6,
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: THEME.spacing.sm + 2 },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fonts.mono,
    color: THEME.colors.primary,
  },
  title: {
    fontSize: THEME.fontSize.lg + 1,
    fontFamily: THEME.fonts.display,
    color: THEME.colors.text,
    flex: 1,
  },
  feedbackRow: { flexDirection: 'row', gap: THEME.spacing.sm },
  feedbackBtn: {
    width: 34,
    height: 34,
    borderRadius: THEME.spacing.sm + 2,
    backgroundColor: THEME.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsRow: { flexDirection: 'row', paddingLeft: 4 },
  itemCard: {
    flex: 1,
    borderRadius: THEME.radius.md,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surface,
    borderWidth: 2,
    borderColor: THEME.colors.card,
  },
  itemImg: { width: '100%', aspectRatio: 1, backgroundColor: THEME.colors.surfaceLight },
  itemType: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fonts.heading,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: THEME.spacing.sm,
    textTransform: 'capitalize',
  },
  explanationRow: {
    flexDirection: 'row',
    paddingTop: THEME.spacing.xs,
  },
  quoteBorder: {
    width: 3,
    backgroundColor: THEME.colors.primary,
    borderRadius: 2,
    marginRight: THEME.spacing.sm + 4,
  },
  explanationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: THEME.spacing.sm,
  },
  explanation: {
    fontSize: THEME.fontSize.md,
    color: THEME.colors.textSecondary,
    lineHeight: 20,
    flex: 1,
    fontFamily: THEME.fonts.body,
  },
})
