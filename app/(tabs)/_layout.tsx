import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let iconName: string = 'home'; // Default icon

          switch (route.name) {
            case 'home':
              iconName = 'home';
              break;
            case 'control':
              iconName = 'settings-remote';
              break;
            case 'notification':
              iconName = 'notifications';
              break;
            case 'schedule':
              iconName = 'calendar-today';
              break;
            case 'sensor':
              iconName = 'sensors';
              break;
          }
        
          return <MaterialIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.darkGray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.gray,
          paddingHorizontal: 10,
          paddingBottom: 5,
          height: 60,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="control" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="notification" />
      <Tabs.Screen name="sensor" />
    </Tabs>
  );
}
