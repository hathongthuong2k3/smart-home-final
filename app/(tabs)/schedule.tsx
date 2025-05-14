// app/tabs/schedule.tsx
import { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/colors';
import { API_ENDPOINTS } from '../constants/api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

interface ScheduleItem {
  index: number;
  deviceID: number;
  deviceName: string;
  deviceType: string;
  description: string;
  startTime: string;
  endTime: string;
  userID: number;
}

export default function ScheduleScreen() {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [action, setAction] = useState<'ON' | 'OFF'>('ON');
  const [userID] = useState(1); // Thay bằng userID thực tế
  const [homeID] = useState(1); // Thay bằng homeID thực tế

  // Lấy danh sách thiết bị khi load trang
  useEffect(() => {
    fetchDevices();
    fetchSchedules();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.DEVICE.GET_ALL, {
        params: { userID, homeID },
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data.devices);
      // Chọn mặc định thiết bị đầu tiên phù hợp nếu có
      const scheduleDevices = res.data.devices.filter(
        (d: any) => d.DType?.toLowerCase().includes('fan') || d.DType?.toLowerCase().includes('led')
      );
      if (scheduleDevices.length > 0) setSelectedDevice(scheduleDevices[0]);
    } catch (err) {
      setDevices([]);
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        API_ENDPOINTS.SCHEDULE.GET_ALL,
        {
          params: { userID },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSchedules(
        res.data.schedules.map((s: any, idx: number) => ({
          index: s.index ?? s.SIndex ?? idx,
          deviceID: s.deviceID ?? s.DeviceID,
          deviceName: s.deviceName ?? s.DeviceName,
          deviceType: s.deviceType ?? s.DeviceType,
          description: s.description ?? s.SDescription,
          startTime: s.startTime ?? s.StartTime,
          endTime: s.endTime ?? s.EndTime,
          userID: s.userID ?? s.UserID,
        }))
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể lấy danh sách lịch');
    }
  };

  const scheduleDevices = devices.filter(
    (d) => d.DType?.toLowerCase().includes('fan') || d.DType?.toLowerCase().includes('led')
  );

  const addSchedule = async () => {
    if (!selectedDevice) {
      Alert.alert('Lỗi', 'Vui lòng chọn thiết bị');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.SCHEDULE.ADD,
        {
          deviceID: selectedDevice.DeviceID,
          hour: date.getHours(),
          minute: date.getMinutes(),
          status: action === 'ON',
          para: 50, // hoặc tuỳ loại thiết bị
          userID,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Hiển thị thông báo thành công
      Alert.alert(
        'Thành công',
        'Đã đặt lịch hẹn thành công!',
        [{ text: 'OK', onPress: () => fetchSchedules() }]
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể thêm lịch');
    }
  };

  const deleteSchedule = async (index: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(API_ENDPOINTS.SCHEDULE.DELETE(index), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSchedules();
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể xóa lịch');
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: COLORS.white }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.black, marginBottom: 20}}>
        Lịch hẹn bật/tắt thiết bị
      </Text>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Chọn thiết bị:</Text>
      {scheduleDevices.length === 0 ? (
        <Text style={{ color: COLORS.red, marginBottom: 20 }}>Không có thiết bị fan/led nào để đặt lịch.</Text>
      ) : (
        <View style={{ flexDirection: 'row', marginBottom: 20, flexWrap: 'wrap' }}>
          {scheduleDevices.map((d) => (
            <TouchableOpacity
              key={d.DeviceID}
              onPress={() => setSelectedDevice(d)}
              style={{
                backgroundColor: selectedDevice?.DeviceID === d.DeviceID ? COLORS.primary : COLORS.gray,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 18,
                marginRight: 14,
                marginBottom: 10,
                flexDirection: 'row',
                alignItems: 'center',
                elevation: selectedDevice?.DeviceID === d.DeviceID ? 2 : 0,
              }}
            >
              {d.DType.toLowerCase().includes('fan') ? (
                <FontAwesome5 name="fan" size={18} color={COLORS.white} style={{ marginRight: 7 }} />
              ) : (
                <MaterialIcons name="wb-sunny" size={20} color={COLORS.white} style={{ marginRight: 7 }} />
              )}
              <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 15 }}>{d.DName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Chọn thời gian:</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{ padding: 12, backgroundColor: COLORS.primary, borderRadius: 14, marginBottom: 20, alignItems: 'center' }}
      >
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="time"
          display="spinner"
          onChange={(_, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Chọn hành động:</Text>
      <View style={{ flexDirection: 'row', marginBottom: 20 }}>
        {['ON', 'OFF'].map((a) => (
          <TouchableOpacity
            key={a}
            onPress={() => setAction(a as 'ON' | 'OFF')}
            style={{
              backgroundColor: action === a ? COLORS.primary : COLORS.gray,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 18,
              marginRight: 14,
              elevation: action === a ? 2 : 0,
            }}
          >
            <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 15 }}>{a === 'ON' ? 'Bật' : 'Tắt'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: COLORS.primary,
          borderRadius: 18,
          paddingVertical: 14,
          alignItems: 'center',
          marginBottom: 18,
          elevation: 2,
        }}
        onPress={addSchedule}
      >
        <MaterialIcons name="add-circle" size={22} color={COLORS.white} style={{ marginRight: 7 }} />
        <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 16 }}>Thêm lịch hẹn</Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 18, marginBottom: 8, color: COLORS.primary }}>Danh sách lịch hẹn:</Text>
      <FlatList
        data={schedules}
        keyExtractor={(item, idx) => (item.index !== undefined ? item.index.toString() : idx.toString())}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 16,
              backgroundColor: COLORS.white,
              borderRadius: 16,
              marginVertical: 7,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <View style={{ marginRight: 14 }}>
              {item.deviceType?.toLowerCase().includes('quạt') ? (
                <FontAwesome5 name="fan" size={28} color={COLORS.primary} />
              ) : (
                <MaterialIcons name="wb-sunny" size={30} color={COLORS.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.darkGray }}>{item.deviceName}</Text>
              <Text style={{ color: COLORS.gray, fontSize: 14, marginVertical: 2 }}>{item.description}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <MaterialIcons name="access-time" size={18} color={COLORS.primary} />
                <Text style={{ marginLeft: 5, color: COLORS.primary, fontWeight: 'bold', fontSize: 15 }}>
                  {item.startTime ? new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Text>
                <Text style={{ marginLeft: 10, color: item.description?.toLowerCase().includes('bật') ? COLORS.green : COLORS.red, fontWeight: 'bold' }}>
                  {item.description?.toLowerCase().includes('bật') ? 'Bật' : 'Tắt'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => deleteSchedule(item.index)} style={{ marginLeft: 10, padding: 6 }}>
              <MaterialIcons name="delete" size={24} color={COLORS.red} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: COLORS.gray, textAlign: 'center', marginTop: 30 }}>Chưa có lịch hẹn nào.</Text>}
      />
    </View>
  );
}
