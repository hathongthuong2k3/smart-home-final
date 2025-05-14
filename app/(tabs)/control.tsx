import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet, Image, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useState, useEffect } from 'react';
import { COLORS } from '../constants/colors';
import { getDevices, manualControl, setDeviceMode, setDeviceThreshold, updateDevice, deleteDevice, getDeviceHistory, verifyDoorPassword, setDoorPassword } from '../services/deviceService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';

// Định nghĩa kiểu dữ liệu cho thiết bị trả về từ backend
interface ApiDevice {
  DeviceID: number;
  DName: string;
  DType: string;
  RoomID: number;
  HomeID: number;
  APIKey: string;
  Status?: string; // Nếu backend trả về trạng thái
  SensorValue?: string; // Nếu backend trả về giá trị cảm biến
}

// Định nghĩa kiểu dữ liệu cho thiết bị hiển thị trên UI
interface Device {
  id: string;
  name: string;
  status: string;
  sensorValue?: string;
  type?: string;
  roomID?: number;
  homeID?: number;
  apiKey?: string;
  mode?: string;
  modeID?: number;
}

export default function ControlScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<string>('Thủ công');
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState('');
  const [editRoomID, setEditRoomID] = useState<number | undefined>(undefined);
  const [editThreshold, setEditThreshold] = useState('');
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deviceModes, setDeviceModes] = useState<{ [deviceId: string]: { mode: string; modeID: number | null } }>({});
  const [showModePicker, setShowModePicker] = useState(false);
  const [selectedDeviceForMode, setSelectedDeviceForMode] = useState<Device | null>(null);
  const [doorAuth, setDoorAuth] = useState<{ [deviceId: string]: boolean }>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingAction, setPendingAction] = useState<{ device: Device; type: 'toggle' | 'mode'; value?: any } | null>(null);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newDoorPassword, setNewDoorPassword] = useState('');

  // Lấy danh sách thiết bị từ backend
  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      const userID = await AsyncStorage.getItem('userID');
      const homeID = await AsyncStorage.getItem('homeID');
      if (userID && homeID) {
        try {
          const devicesFromApi: any[] = await getDevices(Number(userID), Number(homeID));
          const updatedDevices = devicesFromApi.map((d: any) => ({
            id: d.DeviceID.toString(),
            name: d.DName,
            status: d.Status || 'Off',
            sensorValue: d.SensorValue || '',
            type: d.DType,
            roomID: d.RoomID,
            homeID: d.HomeID,
            apiKey: d.APIKey,
            mode: d.CurrentMode === 'AUTO' ? 'Tự động' : 'Thủ công',
            modeID: d.CurrentModeID || 0
          }));
          setDevices(updatedDevices);

          // Cập nhật deviceModes
          const modes: { [deviceId: string]: { mode: string; modeID: number | null } } = {};
          updatedDevices.forEach((device) => {
            modes[device.id] = {
              mode: device.mode || 'Thủ công',
              modeID: device.modeID || 0
            };
          });
          setDeviceModes(modes);
        } catch (err) {
          Alert.alert('Lỗi', 'Không thể lấy danh sách thiết bị');
        }
      }
      setLoading(false);
    };
    fetchDevices();
  }, []);

  // Hàm kiểm tra thiết bị có phải cửa không
  const isDoor = (device: Device) => device.type?.toLowerCase().includes('door');

  // Xác thực mật khẩu cửa
  const handleVerifyPassword = async () => {
    if (!pendingAction) return;
    setLoading(true);
    try {
      await verifyDoorPassword(Number(pendingAction.device.id), passwordInput);
      setDoorAuth((prev) => ({ ...prev, [pendingAction.device.id]: true }));
      setShowPasswordModal(false);
      setPasswordInput('');
      // Sau khi xác thực thành công, thực hiện hành động chờ
      if (pendingAction.type === 'toggle') {
        await handleToggle(pendingAction.device, pendingAction.value, true);
      } else if (pendingAction.type === 'mode') {
        await handleChangeMode(pendingAction.device, pendingAction.value, true);
      }
      setPendingAction(null);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Mật khẩu sai hoặc lỗi xác thực!');
    }
    setLoading(false);
  };

  // Toggle thiết bị (có xác thực cho cửa)
  const handleToggle = async (device: Device, value: boolean, skipAuth = false) => {
    if (isDoor(device) && !doorAuth[device.id] && !skipAuth) {
      setPendingAction({ device, type: 'toggle', value });
      setShowPasswordModal(true);
      return;
    }
    setLoading(true);
    try {
      await manualControl(Number(device.id), value);
      setDevices((prevDevices) =>
        prevDevices.map((d) =>
          d.id === device.id ? { ...d, status: value ? 'On' : 'Off' } : d
        )
      );
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể điều khiển thiết bị');
    }
    setLoading(false);
  };

  // Đổi chế độ thiết bị (có xác thực cho cửa)
  const handleChangeMode = async (device: Device, modeID: number, skipAuth = false) => {
    if (isDoor(device) && !doorAuth[device.id] && !skipAuth) {
      setPendingAction({ device, type: 'mode', value: modeID });
      setShowPasswordModal(true);
      return;
    }
    setLoading(true);
    try {
      const userID = await AsyncStorage.getItem('userID');
      await setDeviceMode(Number(device.id), modeID, Number(userID));
      const newMode = modeID === 0 ? 'Thủ công' : 'Tự động';
      setDeviceModes(prev => ({
        ...prev,
        [device.id]: { mode: newMode, modeID }
      }));
      setDevices(prev => prev.map(d =>
        d.id === device.id
          ? { ...d, mode: newMode, modeID }
          : d
      ));
      Alert.alert('Thành công', 'Đã đổi chế độ thiết bị');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đổi chế độ thiết bị');
    }
    setLoading(false);
  };

  // Đặt mật khẩu cho cửa
  const handleSetDoorPassword = async () => {
    if (!selectedDevice || !newDoorPassword) return;
    setLoading(true);
    try {
      await setDoorPassword(Number(selectedDevice.id), newDoorPassword);
      Alert.alert('Thành công', 'Đã đặt mật khẩu cho cửa');
      setShowSetPasswordModal(false);
      setNewDoorPassword('');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đặt mật khẩu cho cửa');
    }
    setLoading(false);
  };

  // Đặt ngưỡng cho thiết bị
  const handleSetThreshold = async () => {
    if (!selectedDevice || !editThreshold) return;
    setLoading(true);
    try {
      await setDeviceThreshold(Number(selectedDevice.id), Number(editThreshold));
      Alert.alert('Thành công', 'Đã đặt ngưỡng cho thiết bị');
      setShowThresholdModal(false);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể đặt ngưỡng');
    }
    setLoading(false);
  };

  // Sửa thông tin thiết bị
  const handleEditDevice = async () => {
    if (!selectedDevice) return;
    setLoading(true);
    try {
      await updateDevice(selectedDevice.id, {
        DType: editType,
        DName: editName,
        APIKey: selectedDevice.apiKey,
        RoomID: editRoomID,
        HomeID: selectedDevice.homeID,
      });
      setDevices((prev) => prev.map((d) => d.id === selectedDevice.id ? { ...d, name: editName, type: editType, roomID: editRoomID } : d));
      setShowEditModal(false);
      Alert.alert('Thành công', 'Đã cập nhật thiết bị');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật thiết bị');
    }
    setLoading(false);
  };

  // Xóa thiết bị
  const handleDeleteDevice = async (device: Device) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa thiết bị này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await deleteDevice(device.id);
            setDevices((prev) => prev.filter((d) => d.id !== device.id));
            Alert.alert('Thành công', 'Đã xóa thiết bị');
          } catch (err) {
            Alert.alert('Lỗi', 'Không thể xóa thiết bị');
          }
          setLoading(false);
        }
      }
    ]);
  };

  // Xem lịch sử hoạt động thiết bị
  const handleShowHistory = async (device: Device) => {
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const data = await getDeviceHistory(device.id);
      setHistory(data);
    } catch (err) {
      setHistory([]);
      Alert.alert('Lỗi', 'Không thể lấy lịch sử thiết bị');
    }
    setHistoryLoading(false);
  };

  // Mở modal sửa thiết bị
  const openEditModal = (device: Device) => {
    setSelectedDevice(device);
    setEditName(device.name);
    setEditType(device.type || '');
    setEditRoomID(device.roomID);
    setShowEditModal(true);
  };

  // Mở modal đặt ngưỡng
  const openThresholdModal = (device: Device) => {
    setSelectedDevice(device);
    setEditThreshold('');
    setShowThresholdModal(true);
  };

  // Hàm xử lý khi chọn mode từ modal
  const handleModeSelect = (device: Device, mode: string) => {
    const modeID = mode === 'Thủ công' ? 0 : 2;
    handleChangeMode(device, modeID);
    setShowModePicker(false);
  };

  // Mở modal đặt mật khẩu cho cửa
  const openSetPasswordModal = (device: Device) => {
    setSelectedDevice(device);
    setNewDoorPassword('');
    setShowSetPasswordModal(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Điều khiển thiết bị</Text>
      </View>
      {loading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />}
      {!loading && devices.length === 0 && (
        <Text style={styles.emptyText}>Không có thiết bị nào trong nhà này.</Text>
      )}
      {devices.map((device) => (
        <View key={device.id} style={styles.deviceCardBetter}>
          <View style={styles.deviceCardHeaderRowBetter}>
            <View style={styles.deviceIconWrapperBetter}>
              {getDeviceIcon(device.type, 40, '#222')}
            </View>
            <View style={styles.deviceInfoBetter}>
              <Text style={styles.deviceNameBetter}>{device.name}</Text>
              <Text style={styles.deviceTypeBetter}>{device.type}</Text>
            </View>
            <Switch
              value={device.status === 'On'}
              onValueChange={(value) => handleToggle(device, value)}
              trackColor={{ false: COLORS.gray, true: COLORS.primary }}
              thumbColor={COLORS.white}
              style={styles.switchBetter}
            />
          </View>
          {device.sensorValue ? (
            <Text style={styles.deviceStatusBetter}>{`Giá trị: ${device.sensorValue}`}</Text>
          ) : null}
          <View style={styles.actionRowBetter}>
            <TouchableOpacity style={styles.actionBtnBetter} onPress={() => openEditModal(device)}>
              <Text style={styles.actionTextBlue}>Sửa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnBetter} onPress={() => handleDeleteDevice(device)}>
              <Text style={styles.actionTextRed}>Xóa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnBetter} onPress={() => handleShowHistory(device)}>
              <Text style={styles.actionTextBlue}>Lịch sử</Text>
            </TouchableOpacity>
            {/* Nếu là cửa thì hiện nút Mật khẩu, ngược lại hiện Ngưỡng */}
            {isDoor(device) ? (
              <TouchableOpacity style={styles.actionBtnBetter} onPress={() => openSetPasswordModal(device)}>
                <Text style={styles.actionTextBlue}>Mật khẩu</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionBtnBetter} onPress={() => openThresholdModal(device)}>
                <Text style={styles.actionTextBlue}>Ngưỡng</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.modePickerContainerBetter}>
            <Text style={styles.modeLabelBetter}>Chế độ:</Text>
            <TouchableOpacity 
              style={styles.modeInputBetter}
              onPress={() => {
                setSelectedDeviceForMode(device);
                setShowModePicker(true);
              }}
            >
              <Text style={styles.modeInputTextBetter}>
                {deviceModes[device.id]?.mode || 'Thủ công'}
              </Text>
              <FontAwesome5 name="chevron-down" size={12} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {/* Modal sửa thiết bị */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sửa thiết bị</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Tên thiết bị"
            />
            <TextInput
              style={styles.input}
              value={editType}
              onChangeText={setEditType}
              placeholder="Loại thiết bị"
            />
            <TextInput
              style={styles.input}
              value={editRoomID ? editRoomID.toString() : ''}
              onChangeText={(text) => setEditRoomID(Number(text))}
              placeholder="Room ID"
              keyboardType="numeric"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleEditDevice}>
                <Text style={styles.modalBtnText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal đặt ngưỡng */}
      <Modal visible={showThresholdModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt ngưỡng thiết bị</Text>
            <TextInput
              style={styles.input}
              value={editThreshold}
              onChangeText={setEditThreshold}
              placeholder="Nhập ngưỡng"
              keyboardType="numeric"
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSetThreshold}>
                <Text style={styles.modalBtnText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowThresholdModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal lịch sử thiết bị */}
      <Modal visible={showHistoryModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lịch sử thiết bị</Text>
            {historyLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {history.length === 0 ? (
                  <Text>Không có dữ liệu</Text>
                ) : (
                  history.map((item, idx) => (
                    <View key={idx} style={{ marginBottom: 10 }}>
                      <Text>{item.ATime}: {item.ADescription} ({item.AMode})</Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowHistoryModal(false)}>
              <Text style={styles.modalBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal chọn mode */}
      <Modal
        visible={showModePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modePickerModal}>
            <View style={styles.modePickerHeader}>
              <Text style={styles.modePickerTitle}>Chọn chế độ</Text>
              <TouchableOpacity onPress={() => setShowModePicker(false)}>
                <FontAwesome5 name="times" size={20} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>
            <View style={styles.modePickerContent}>
              <TouchableOpacity 
                style={styles.modeOption}
                onPress={() => selectedDeviceForMode && handleModeSelect(selectedDeviceForMode, 'Thủ công')}
              >
                <Text style={styles.modeOptionText}>Thủ công</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modeOption}
                onPress={() => selectedDeviceForMode && handleModeSelect(selectedDeviceForMode, 'Tự động')}
              >
                <Text style={styles.modeOptionText}>Tự động</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal nhập mật khẩu xác thực cửa */}
      <Modal visible={showPasswordModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập mật khẩu cửa</Text>
            <TextInput
              style={styles.input}
              value={passwordInput}
              onChangeText={setPasswordInput}
              placeholder="Nhập mật khẩu"
              secureTextEntry
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleVerifyPassword}>
                <Text style={styles.modalBtnText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setShowPasswordModal(false); setPasswordInput(''); setPendingAction(null); }}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal đặt mật khẩu cửa */}
      <Modal visible={showSetPasswordModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt mật khẩu cửa</Text>
            <TextInput
              style={styles.input}
              value={newDoorPassword}
              onChangeText={setNewDoorPassword}
              placeholder="Nhập mật khẩu mới"
              secureTextEntry
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleSetDoorPassword}>
                <Text style={styles.modalBtnText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setShowSetPasswordModal(false)}>
                <Text style={styles.modalBtnText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Hàm lấy icon phù hợp với loại thiết bị
function getDeviceIcon(type?: string, size = 40, color = '#222') {
  if (!type) return <FontAwesome5 name="question-circle" size={size} color={color} />;
  const t = type.toLowerCase();
  if (t.includes('light') || t.includes('led')) return <FontAwesome5 name="lightbulb" size={size} color={color} solid />;
  if (t.includes('fan')) return <FontAwesome5 name="fan" size={size} color={color} />;
  if (t.includes('door')) return <FontAwesome5 name="door-open" size={size} color={color} />;
  if (t.includes('gas')) return <FontAwesome5 name="burn" size={size} color={color} />;
  if (t.includes('buzzer')) return <FontAwesome5 name="bell" size={size} color={color} solid />;
  if (t.includes('sun')) return <FontAwesome5 name="sun" size={size} color={color} solid />;
  return <FontAwesome5 name="question-circle" size={size} color={color} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 40,
  },
  deviceCardBetter: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  deviceCardHeaderRowBetter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceIconWrapperBetter: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceInfoBetter: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  deviceNameBetter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  deviceTypeBetter: {
    fontSize: 13,
    color: COLORS.gray,
  },
  deviceStatusBetter: {
    fontSize: 13,
    color: COLORS.primary,
    marginLeft: 4,
    marginBottom: 2,
  },
  switchBetter: {
    marginLeft: 8,
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  actionRowBetter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  actionBtnBetter: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
  },
  actionTextBlue: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  actionTextRed: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modePickerContainerBetter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  modeLabelBetter: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginRight: 8,
  },
  modeInputBetter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 160,
  },
  modeInputTextBetter: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  modalBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modePickerModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxWidth: 300,
    padding: 16,
  },
  modePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  modePickerContent: {
    gap: 12,
  },
  modeOption: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
  modeOptionText: {
    fontSize: 16,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
});