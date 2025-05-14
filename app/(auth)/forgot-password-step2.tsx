import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';

export default function ForgotPasswordStep2Screen() {
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');

  const handleResetPassword = () => {
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
        placeholder="Verify Code"
        value={verifyCode}
        onChangeText={setVerifyCode}
        style={styles.input}
      />
      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        placeholder="Confirm New Password"
        value={confirmNewPassword}
        onChangeText={setConfirmNewPassword}
        secureTextEntry
        style={styles.input}
      />
      {/* Nút Reset your password */}
      <Link href="/(auth)/authentication" asChild>
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset your password</Text>
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