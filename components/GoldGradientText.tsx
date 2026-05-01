import { Text, StyleProp, TextStyle, Platform } from 'react-native'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { THEME } from '../constants/theme'

interface Props {
  text: string
  style?: StyleProp<TextStyle>
  colors?: string[]
}

export default function GoldGradientText({
  text,
  style,
  colors = [THEME.colors.gradientStart, THEME.colors.gradientEnd],
}: Props) {
  // MaskedView not supported on web — fall back to solid gold
  if (Platform.OS === 'web') {
    return (
      <Text style={[{ color: THEME.colors.primary }, style]}>
        {text}
      </Text>
    )
  }

  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]}>
          {text}
        </Text>
      }
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[style, { opacity: 0 }]}>{text}</Text>
      </LinearGradient>
    </MaskedView>
  )
}
