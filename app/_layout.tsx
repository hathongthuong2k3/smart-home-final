import { Stack } from 'expo-router';
import { DeviceProvider } from './context/DeviceContext';
import { AuthProvider } from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <DeviceProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(splash)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </DeviceProvider>
    </AuthProvider>
  );
}