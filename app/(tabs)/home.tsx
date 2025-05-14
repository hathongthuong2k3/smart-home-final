import { View, Text, FlatList, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDeviceContext } from '../context/DeviceContext';
import { COLORS } from '../constants/colors';
import { useState, useEffect } from 'react';
import SettingsPopup from '../components/Popup';
import { Link } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/api';

// Thêm interface cho Sensor và SensorData
interface Sensor {
  SensorID: number;
  SName: string;
  SType: string;
  RoomID: number;
  HomeID: number;
  APIKey: string;
}

interface LatestSensorData {
  sensorID: number;
  time: string | null;
  value: string | number | null;
}

export default function HomeScreen() {
  const { rooms, updateDeviceStatus } = useDeviceContext();
  const [isSettingsVisible, setIsSettingsVisible] = useState<boolean>(false);
  // Thêm state cho cảm biến
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorData, setSensorData] = useState<LatestSensorData[]>([]);
  const [loadingSensors, setLoadingSensors] = useState(false);

  const userID = 1; // Lấy từ context thực tế
  const homeID = 1; // Lấy từ context thực tế

  const getToken = async () => await AsyncStorage.getItem('token');

  // Lấy danh sách cảm biến
  const fetchSensors = async () => {
    try {
      setLoadingSensors(true);
      const token = await getToken();
      const res = await axios.get(API_ENDPOINTS.SENSOR.GET_ALL, {
        params: { userID, homeID },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSensors(res.data.sensors);
    } catch (err) {
      setSensors([]);
    } finally {
      setLoadingSensors(false);
    }
  };

  // Lấy dữ liệu mới nhất của cảm biến
  const fetchLatestSensorData = async (sensorIDs: number[]) => {
    try {
      if (!sensorIDs.length) return setSensorData([]);
      const token = await getToken();
      const ids = sensorIDs.join(',');
      const res = await axios.get(API_ENDPOINTS.SENSOR.GET_DATA, {
        params: { ids },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSensorData(res.data);
    } catch (err) {
      setSensorData([]);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  useEffect(() => {
    if (sensors.length > 0) {
      fetchLatestSensorData(sensors.map(s => s.SensorID));
    } else {
      setSensorData([]);
    }
  }, [sensors]);

  const handleToggleDevice = (roomName: string, deviceName: string, currentStatus: string) => {
    const newStatus = currentStatus === 'BẬT' ? 'TẮT' : 'BẬT';
    updateDeviceStatus(roomName, deviceName, newStatus);
  };

  const handleAddAccess = (email: string) => {
    // Thêm logic để gửi email truy cập ở đây (ví dụ: gọi API)
  };

  // Map icon cho từng loại cảm biến
  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'Nhiệt độ':
      case 'Temperature':
        return 'device-thermostat'; // Đúng tên icon trong MaterialIcons
      case 'Độ ẩm':
      case 'Humidity':
        return 'water-drop';
      case 'Ánh sáng':
      case 'Light':
        return 'wb-sunny';
      case 'Âm thanh':
      case 'Sound':
        return 'graphic-eq';
      case 'Khí gas':
      case 'Gas':
        return 'science';
      case 'Khoảng cách':
      case 'Distance':
        return 'waves';
      default:
        return 'sensors';
    }
  };

  // Hiển thị card cảm biến
  const renderSensorCards = () => (
    <View style={styles.sensorCardContainer}>
      {loadingSensors ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : sensors.length === 0 ? (
        <Text style={{ textAlign: 'center', color: COLORS.gray, marginVertical: 20 }}>Không có cảm biến nào</Text>
      ) : (
        sensors.map(sensor => {
          const latest = sensorData.find(d => d.sensorID === sensor.SensorID);
          return (
            <View key={sensor.SensorID} style={styles.sensorCard}>
              <MaterialIcons name={getSensorIcon(sensor.SType)} size={36} color={COLORS.primary} />
              <Text style={styles.sensorName}>{sensor.SName}</Text>
              <Text style={styles.sensorValue}>{latest && latest.value !== undefined && latest.value !== null ? latest.value : '--'}</Text>
              <Text style={styles.sensorType}>{sensor.SType}</Text>
            </View>
          );
        })
      )}
    </View>
  );

  const renderDevice = ({ item, roomName }: { item: any; roomName: string }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceInfo}>
        <MaterialIcons name={item.icon} size={24} color={COLORS.darkGray} style={styles.deviceIcon} />
        <Text style={styles.deviceName}>{item.name}</Text>
      </View>
      <View style={styles.deviceStatusContainer}>
        <Text
          style={[
            styles.deviceStatus,
            { color: item.status === 'BẬT' || item.status === 'TỐT' ? COLORS.primary : COLORS.gray },
          ]}
        >
          {item.status}
        </Text>
        {item.canToggle && (
          <Switch
            value={item.status === 'BẬT'}
            onValueChange={() => handleToggleDevice(roomName, item.name, item.status)}
            trackColor={{ false: COLORS.gray, true: COLORS.primary }}
            thumbColor={COLORS.white}
            style={styles.switch}
          />
        )}
      </View>
    </View>
  );

  const renderRoom = ({ item }: { item: any }) => (
    <View style={styles.roomContainer}>
      <Text style={styles.roomTitle}>{item.name}</Text>
      <View style={styles.environmentCard}>
        <View style={styles.environmentItem}>
          <MaterialIcons name="thermostat" size={20} color={COLORS.darkGray} />
          <Text style={styles.environmentText}>NHIỆT ĐỘ: {item.temperature}°C</Text>
        </View>
        <View style={styles.environmentItem}>
          <MaterialIcons name="water-drop" size={20} color={COLORS.darkGray} />
          <Text style={styles.environmentText}>ĐỘ ẨM: {item.humidity}%</Text>
        </View>
        <View style={styles.environmentItem}>
          <MaterialIcons name="nature" size={20} color={COLORS.green} />
          <Text style={[styles.environmentText, { color: COLORS.green }]}>CHẤT LƯỢNG KHÔNG KHÍ: {item.airQuality}%</Text>
        </View>
      </View>
      {item.devices.length > 0 && (
        <FlatList
          data={item.devices}
          renderItem={({ item }) => renderDevice({ item, roomName: item.name })}
          keyExtractor={(item) => item.name}
          scrollEnabled={false}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
          <MaterialIcons name="settings" size={28} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Home</Text>
        <Link href="../(auth)/profile" asChild>
          <TouchableOpacity>
            <View style={styles.profileIcon}>
              <MaterialIcons name="person" size={24} color={COLORS.darkGray} />
            </View>
          </TouchableOpacity>
        </Link>
      </View>
      {/* Cảm biến */}
      {renderSensorCards()}
      {/* Settings Popup */}
      <SettingsPopup
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
  },
  roomContainer: {
    marginBottom: 20,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10,
  },
  environmentCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  environmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  environmentText: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginLeft: 10,
  },
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  deviceIcon: {
    marginRight: 10,
  },
  deviceName: {
    fontSize: 14,
    color: COLORS.darkGray,
    flex: 1,
  },
  deviceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  deviceStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
    color: COLORS.darkGray,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    marginLeft: 5,
  },
  // Thêm style cho card cảm biến
  sensorCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  sensorCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  sensorName: {
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 15,
    color: COLORS.darkGray,
  },
  sensorValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: COLORS.primary,
  },
  sensorType: {
    color: COLORS.gray,
    fontSize: 13,
  },
});