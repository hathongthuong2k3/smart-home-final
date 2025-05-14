import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';

export default function ForgotPasswordStep1Screen() {
  const [email, setEmail] = useState<string>('');

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/icon.png')} // Thay bằng logo của bạn
        style={styles.logo}
      />
      {/* Tiêu đề */}
      <Text style={styles.title}>MY SMART HOUSE</Text>
      {/* Trường nhập liệu */}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      {/* Nút Confirm */}
      <Link href="/(auth)/forgot-password-step2" asChild>
        <TouchableOpacity style={styles.button} onPress={handleConfirm}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </Link>
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
    marginBottom: 20,
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
});