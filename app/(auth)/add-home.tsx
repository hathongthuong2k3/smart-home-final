import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddHomeScreen() {
  const [homeID, setHomeID] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddHome = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!homeID.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập Home ID');
      return;
    }
    setLoading(true);
    try {
      await AsyncStorage.setItem('homeID', homeID.trim());
      router.replace('/(tabs)/home');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lưu Home ID');
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.darkGray, marginBottom: 20 }}>
        Nhập Home ID
      </Text>
      <TextInput
        placeholder="Home ID"
        value={homeID}
        onChangeText={setHomeID}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: COLORS.gray,
          padding: 10,
          width: '100%',
          marginBottom: 20,
          borderRadius: 5,
          color: COLORS.darkGray,
        }}
      />
      <TouchableOpacity
        style={{
          backgroundColor: COLORS.primary,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 10,
          width: '100%',
          alignItems: 'center',
          opacity: loading ? 0.6 : 1,
        }}
        onPress={handleAddHome}
        disabled={loading}
      >
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Đang lưu...' : 'Lưu'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}