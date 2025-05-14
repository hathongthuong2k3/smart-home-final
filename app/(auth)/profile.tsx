import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [fullname, setFullname] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userID = await AsyncStorage.getItem('userID');
      const res = await axios.get(API_ENDPOINTS.USER.GET_BY_ID(userID), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setFullname(res.data.Fullname);
      setDob(res.data.Dob?.slice(0, 10) || '');
      setTel(res.data.Tel);
      setEmail(res.data.Email);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleUpdateUser = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userID = await AsyncStorage.getItem('userID');
      await axios.put(API_ENDPOINTS.USER.UPDATE(userID), {
        fullname,
        dob,
        email,
        tel,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditMode(false);
      fetchUser();
      Alert.alert('Thành công', 'Cập nhật thông tin thành công!');
    } catch (err) {
      Alert.alert('Lỗi', 'Cập nhật thất bại!');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đủ mật khẩu cũ và mới');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const userID = await AsyncStorage.getItem('userID');
      await axios.put(API_ENDPOINTS.USER.CHANGE_PASS(userID), {
        oldPassword,
        newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOldPassword('');
      setNewPassword('');
      setShowPasswordModal(false);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công!');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Đổi mật khẩu thất bại!');
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      // Hiển thị loading
      setLoading(true);
      
      // Xóa tất cả dữ liệu trong AsyncStorage
      await AsyncStorage.clear();
      
      // Chuyển về màn hình đăng nhập
      router.replace('/(auth)/authentication');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Overlay loading */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
        {/* Card profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <MaterialIcons name="person" size={90} color={COLORS.primary} style={styles.avatar} />
          </View>
          <Text style={styles.profileName}>{fullname}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
        {/* Thông tin cá nhân */}
        <View style={styles.infoSection}>
          <InfoRow
            icon={<Feather name="user" size={22} color={COLORS.primary} />}
            label="Họ tên"
            value={fullname}
            editable={editMode}
            onChangeText={setFullname}
          />
          <InfoRow
            icon={<FontAwesome name="birthday-cake" size={22} color={COLORS.primary} />}
            label="Ngày sinh"
            value={dob}
            editable={editMode}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
          />
          <InfoRow
            icon={<Feather name="phone" size={22} color={COLORS.primary} />}
            label="Số điện thoại"
            value={tel}
            editable={editMode}
            onChangeText={setTel}
            keyboardType="phone-pad"
          />
          <InfoRow
            icon={<MaterialIcons name="email" size={22} color={COLORS.primary} />}
            label="Email"
            value={email}
            editable={editMode}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        {/* Nút chỉnh sửa/lưu */}
        {editMode ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
            <MaterialIcons name="save" size={20} color={COLORS.white} />
            <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
            <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
        )}
        {/* Nút đổi mật khẩu */}
        <TouchableOpacity style={styles.passwordButton} onPress={() => setShowPasswordModal(true)}>
          <Feather name="lock" size={20} color={COLORS.primary} />
          <Text style={styles.passwordButtonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>
        {/* Nút đăng xuất */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={20} color={COLORS.white} />
          <Text style={styles.signOutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
        {/* Modal đổi mật khẩu */}
        <Modal
          visible={showPasswordModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
              <TextInput
                placeholder="Mật khẩu cũ"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
                style={styles.infoInput}
              />
              <TextInput
                placeholder="Mật khẩu mới"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.infoInput}
              />
              <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                  <Text style={styles.saveButtonText}>Lưu</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: COLORS.gray }]} onPress={() => setShowPasswordModal(false)}>
                  <Text style={[styles.saveButtonText, { color: COLORS.darkGray }]}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InfoRow({ icon, label, value, editable, onChangeText, ...props }: any) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        {editable ? (
          <TextInput
            style={[styles.infoInput, { backgroundColor: '#f7f7f7', borderColor: COLORS.primary }]}
            value={value}
            onChangeText={onChangeText}
            {...props}
          />
        ) : (
          <Text style={styles.infoValue}>{value}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f6f8fa',
    padding: 0,
    alignItems: 'center',
    paddingBottom: 40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    width: '92%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 30,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#e3f0fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatar: {
    alignSelf: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 6,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 2,
  },
  infoSection: {
    width: '92%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  infoIcon: {
    width: 36,
    alignItems: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '500',
    paddingVertical: 2,
  },
  infoInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 7,
    padding: 8,
    fontSize: 15,
    color: COLORS.darkGray,
    marginTop: 2,
    marginBottom: 2,
    width: '100%',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f0fc',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  editButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    marginLeft: 7,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 7,
  },
  passwordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7e7e7',
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  passwordButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    marginLeft: 7,
    fontWeight: 'bold',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.red,
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 8,
    width: '92%',
    justifyContent: 'center',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 18,
  },
});