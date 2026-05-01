import { Tabs } from 'expo-router'
import CustomTabBar from '../../components/CustomTabBar'
import { THEME } from '../../constants/theme'

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
      sceneContainerStyle={{ backgroundColor: THEME.colors.background }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="wardrobe" options={{ title: 'Wardrobe' }} />
      <Tabs.Screen name="add-item" options={{ title: 'Add' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  )
}
