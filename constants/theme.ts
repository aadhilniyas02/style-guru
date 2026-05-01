export const THEME = {
  colors: {
    // Core brand — warm gold primary on deep dark backgrounds ("Tropical Noir")
    primary: '#D4A853',           // warm gold — Sri Lankan brass & jewelry
    primaryDim: '#B8922F',
    primaryLight: 'rgba(212,168,83,0.15)',
    primaryGlow: 'rgba(212,168,83,0.35)',
    accent: '#E07A5F',            // terracotta coral — Sri Lankan earth tones
    accentDim: 'rgba(224,122,95,0.12)',
    secondary: '#2EC4B6',         // teal for contrast moments
    secondaryLight: 'rgba(46,196,182,0.12)',

    // Surfaces — warmed dark layers
    background: '#0C0A08',        // warm near-black base
    card: '#151311',              // elevated card
    cardHover: '#1D1A16',         // card hover / pressed
    surface: '#211E19',           // secondary surface (inputs, pickers)
    surfaceLight: '#2B2720',      // tertiary surface

    // Text — slightly warmer whites
    text: '#F5F0E8',              // cream-white primary text
    textSecondary: '#B0A898',     // secondary / muted
    textTertiary: '#7A7060',      // hints, captions
    white: '#FFFFFF',
    black: '#000000',

    // Borders & dividers
    border: 'rgba(212,168,83,0.08)',
    borderLight: 'rgba(212,168,83,0.15)',
    borderAccent: 'rgba(212,168,83,0.25)',

    // Semantic
    success: '#2EC4B6',
    error: '#E07A5F',
    warning: '#F4C430',

    // Gradients
    gradientStart: '#D4A853',
    gradientEnd: '#E07A5F',
    gradientLuxStart: '#D4A853',
    gradientLuxEnd: '#2EC4B6',

    // Glass / overlay
    glass: 'rgba(21,19,17,0.85)',
    glassLight: 'rgba(21,19,17,0.6)',
    shimmer: 'rgba(212,168,83,0.06)',
  },

  fonts: {
    display: 'PlayfairDisplay_700Bold',
    displayBlack: 'PlayfairDisplay_900Black',
    heading: 'DMSans_700Bold',
    headingMedium: 'DMSans_500Medium',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    mono: 'JetBrainsMono_700Bold',
    monoRegular: 'JetBrainsMono_400Regular',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  fontSize: {
    caption: 10,
    overline: 11,
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
    title: 34,
    hero: 42,
  },

  radius: {
    sm: 8,
    md: 14,
    lg: 22,
    xl: 30,
    full: 9999,
  },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    glow: {
      shadowColor: '#D4A853',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 12,
    },
  },

  animation: {
    fast: 200,
    medium: 350,
    slow: 600,
    spring: { damping: 15, stiffness: 150, mass: 1 },
    springBouncy: { damping: 12, stiffness: 180, mass: 0.8 },
  },
}
