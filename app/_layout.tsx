import { useEffect } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator, Platform } from 'react-native'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_900Black,
} from '@expo-google-fonts/playfair-display'
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans'
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono'
import { useAuth } from '../hooks/useAuth'
import { THEME } from '../constants/theme'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { session, loading } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_900Black,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  useEffect(() => {
    if (loading || !fontsLoaded) return

    const inAuthGroup = segments[0] === '(auth)'
    const inTabs = segments[0] === '(tabs)'
    const onIndex = segments[0] === undefined || segments[0] === 'index'

    if (!session && !inAuthGroup && !onIndex) {
      router.replace('/')
    } else if (session && (inAuthGroup || onIndex)) {
      router.replace('/(tabs)/')
    }
  }, [session, loading, segments, fontsLoaded])

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: THEME.colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: THEME.colors.background }, animation: 'fade' }} />
    </>
  )
}
