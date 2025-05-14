import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { useState } from 'react';
import { COLORS } from '../constants/colors';
import { BlurView } from 'expo-blur';

interface SettingsPopupProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsPopup({ visible, onClose }: SettingsPopupProps) {
  const [isSensorSound, setIsSensorSound] = useState<boolean>(false);
  const [isSensorNotification, setIsSensorNotification] = useState<boolean>(false);
  const [isNightMode, setIsNightMode] = useState<boolean>(false);
  const [isEnergySavingMode, setIsEnergySavingMode] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const handleCheckUpdate = () => {
    console.log('Checking for software updates...');
    alert('Đang kiểm tra cập nhật phần mềm...');
  };

  const handleCheckDeviceStatus = () => {
    console.log('Checking device status...');
    alert('Đang kiểm tra trạng thái thiết bị...');
  };

  const handleResetSettings = () => {
    setIsSensorSound(false);
    setIsSensorNotification(false);
    setIsNightMode(false);
    setIsEnergySavingMode(false);
    setIsOfflineMode(false);
    console.log('Settings have been reset to default.');
    alert('Đã đặt lại cài đặt về mặc định.');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <BlurView intensity={50} tint="dark" style={styles.overlay}>
        <View style={styles.popup}>
          <ScrollView style={styles.scrollView}>
            {/* Tiêu đề */}
            <Text style={styles.header}>Cài đặt</Text>

            {/* Âm thanh cảm biến */}
            <View style={styles.settingContainer}>
              <Text style={styles.settingName}>Âm thanh cảm biến</Text>
              <Switch
                value={isSensorSound}
                onValueChange={setIsSensorSound}
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Thông báo cảm biến */}
            <View style={styles.settingContainer}>
              <Text style={styles.settingName}>Thông báo cảm biến</Text>
              <Switch
                value={isSensorNotification}
                onValueChange={setIsSensorNotification}
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Chế độ ban đêm */}
            <View style={styles.settingContainer}>
              <Text style={styles.settingName}>Chế độ ban đêm</Text>
              <Switch
                value={isNightMode}
                onValueChange={setIsNightMode}
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Chế độ tiết kiệm năng lượng */}
            <View style={styles.settingContainer}>
              <Text style={styles.settingName}>Chế độ tiết kiệm năng lượng</Text>
              <Switch
                value={isEnergySavingMode}
                onValueChange={setIsEnergySavingMode}
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Chế độ ngoại tuyến */}
            <View style={styles.settingContainer}>
              <Text style={styles.settingName}>Chế độ ngoại tuyến</Text>
              <Switch
                value={isOfflineMode}
                onValueChange={setIsOfflineMode}
                trackColor={{ false: COLORS.gray, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>

            {/* Các nút chức năng */}
            <TouchableOpacity 
              style={[styles.buttonContainer, { backgroundColor: '#FFC107' }]} 
              onPress={handleCheckUpdate}
            >
              <Text style={styles.buttonText}>Cập nhật phần mềm</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.buttonContainer, { backgroundColor: '#4CAF50' }]} 
              onPress={handleCheckDeviceStatus}
            >
              <Text style={styles.buttonText}>Kiểm tra trạng thái thiết bị</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.buttonContainer, { backgroundColor: '#F44336' }]} 
              onPress={handleResetSettings}
            >
              <Text style={styles.buttonText}>Đặt lại cài đặt</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.buttonContainer, { backgroundColor: COLORS.gray, marginTop: 10 }]} 
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: COLORS.darkGray }]}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  buttonContainer: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});