import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { login } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function AuthenticationScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let newErrors: {[key: string]: string} = {};
    if (!username) newErrors.username = 'Vui lòng nhập username';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      const response = await login(username, password);
      // Lưu token vào AsyncStorage
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
      }
      if (response.user && response.user.ID) {
        await AsyncStorage.setItem('userID', response.user.ID.toString());
      }
      if (response.homeId && Number(response.homeId) > 0) {
        await AsyncStorage.setItem('homeID', response.homeId.toString());
        router.replace('/(tabs)/home');
      } else {
        await AsyncStorage.removeItem('homeID');
        router.replace('/(auth)/add-home');
      }
    } catch (error: any) {
      let message = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      if (error?.response?.data?.message) {
        message = error.response.data.message;
      }
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>MY SMART HOUSE</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={[styles.input, errors.username && styles.inputError]}
        autoCapitalize="none"
      />
      {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
      <View style={{ width: '100%', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={[styles.input, { flex: 1 }, errors.password && styles.inputError]}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10 }}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>
      {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>
      <View style={styles.linksContainer}>
        <Link href="/(auth)/forgot-password-step1" asChild>
          <Text style={styles.link}>Quên mật khẩu?</Text>
        </Link>
        <View style={styles.signUpContainer}>
          <Text style={styles.linkText}>Chưa có tài khoản? </Text>
          <Link href="/(auth)/signup" asChild>
            <Text style={styles.link}>Đăng ký</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    padding: 10,
    width: '100%',
    borderRadius: 5,
    color: COLORS.darkGray,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  link: {
    color: COLORS.primary,
    fontSize: 14,
  },
  signUpContainer: {
    flexDirection: 'row',
  },
  linkText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 5,
    marginLeft: 5,
    fontSize: 13,
  },
});