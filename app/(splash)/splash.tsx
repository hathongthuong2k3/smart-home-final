import { View, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '../constants/colors';

// Ngăn màn hình Splash mặc định của Expo tự động ẩn
SplashScreen.preventAutoHideAsync();

export default function SplashScreenCustom() {
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Ẩn màn hình Splash mặc định của Expo
      await SplashScreen.hideAsync();
      // Chuyển sang màn hình Opening (Get Started)
      router.replace('/(auth)/opening');
    }, 3000); // Hiển thị Splash trong 3 giây

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/splash-icon.png')} // Thay bằng logo của bạn
        style={styles.logo}
      />
      {/* Thêm vòng quay (spinner) */}
      <ActivityIndicator size="large" color={COLORS.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  spinner: {
    marginTop: 20,
  },
});