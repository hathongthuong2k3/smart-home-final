import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import { register } from '../services/authService';
import DateTimePicker from '@react-native-community/datetimepicker';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function validatePassword(password: string) {
  // Tối thiểu 6 ký tự, có chữ và số
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
}

function validatePhone(phone: string) {
  return /^[0-9]{9,12}$/.test(phone);
}

export default function SignUpScreen() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState(''); // yyyy-mm-dd
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Error states
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      setDob(`${yyyy}-${mm}-${dd}`);
    }
  };

  const handleSignUp = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Validate fields
    let newErrors: {[key: string]: string} = {};
    if (!username) newErrors.username = 'Vui lòng nhập username';
    if (!name) newErrors.name = 'Vui lòng nhập họ tên';
    if (!dob) newErrors.dob = 'Vui lòng chọn ngày sinh';
    if (!tel || !validatePhone(tel)) newErrors.tel = 'Số điện thoại không hợp lệ';
    if (!email || !validateEmail(email)) newErrors.email = 'Email không hợp lệ';
    if (!password || !validatePassword(password)) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự, gồm chữ và số';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const userData = { username, password, name, dob, email, tel };
      const response = await register(userData);
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.');
      router.replace('/(auth)/authentication');
    } catch (error) {
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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

      <TextInput
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={[styles.input, errors.name && styles.inputError]}
      />
      {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input, styles.dateInput, errors.dob && styles.inputError]}>
        <Text style={{ color: dob ? COLORS.darkGray : COLORS.gray }}>
          {dob ? dob : 'Date of Birth (YYYY-MM-DD)'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dob ? new Date(dob) : new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}
      {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

      <TextInput
        placeholder="Phone Number"
        value={tel}
        onChangeText={setTel}
        style={[styles.input, errors.tel && styles.inputError]}
        keyboardType="phone-pad"
      />
      {errors.tel && <Text style={styles.errorText}>{errors.tel}</Text>}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, errors.email && styles.inputError]}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, errors.password && styles.inputError]}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={[styles.input, errors.confirmPassword && styles.inputError]}
      />
      {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Đang đăng ký...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <View style={styles.signInContainer}>
        <Text style={styles.linkText}>Already have an account? </Text>
        <Link href="/(auth)/authentication" asChild>
          <Text style={styles.link}>Sign In</Text>
        </Link>
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
  signInContainer: {
    flexDirection: 'row',
  },
  linkText: {
    color: COLORS.darkGray,
    fontSize: 14,
  },
  link: {
    color: COLORS.primary,
    fontSize: 14,
  },
  dateInput: {
    justifyContent: 'center',
    height: 50,
    paddingLeft: 10,
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
  buttonDisabled: {
    opacity: 0.7,
  },
});