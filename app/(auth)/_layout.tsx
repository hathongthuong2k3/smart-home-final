import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="opening" />
      <Stack.Screen name="authentication" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password-step1" />
      <Stack.Screen name="forgot-password-step2" />
      <Stack.Screen name="add-home" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}