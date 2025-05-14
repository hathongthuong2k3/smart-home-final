import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, Button, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { COLORS } from '../constants/colors';
import { API_ENDPOINTS } from '../constants/api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Sensor {
  SensorID: number;
  SName: string;
  SType: string;
  RoomID: number;
  HomeID: number;
  APIKey: string;
}

interface SensorDetail {
  SensorID: number;
  SName: string;
  SType: string;
  DataEdge: string;
  APIKey: string;
  RoomID: number;
  RoomName: string;
  HomeID: number;
  HomeName: string;
  UserID: number;
}

interface SensorData {
  sensorID: number;
  time: string;
  value: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

// Thêm interface cho đơn vị và màu sắc của cảm biến
interface SensorConfig {
  unit: string;
  color: string;
  gradient: [string, string];
}

// Cập nhật lại bảng màu cho cảm biến với màu pastel nhẹ nhàng
const SENSOR_CONFIGS: { [key: string]: SensorConfig } = {
  'Temperature Sensor': {
    unit: '°C',
    color: '#FF9F9F',
    gradient: ['#FFF5F5', '#FFE5E5']
  },
  'Humidity Sensor': {
    unit: '%',
    color: '#A5D8FF',
    gradient: ['#F5F9FF', '#E5F1FF']
  },
  'Light Sensor': {
    unit: 'lux',
    color: '#FFD6A5',
    gradient: ['#FFF9F0', '#FFF0E0']
  },
  'Gas Sensor': {
    unit: 'ppm',
    color: '#B5EAD7',
    gradient: ['#F0FFF9', '#E0FFF0']
  }
};

// Cập nhật default config với màu trung tính
const DEFAULT_SENSOR_CONFIG: SensorConfig = {
  unit: '',
  color: '#94A3B8',
  gradient: ['#F8FAFC', '#F1F5F9']
};

// Sửa lại hàm getSensorConfig để an toàn hơn
const getSensorConfig = (sensorType: string): SensorConfig => {
  return SENSOR_CONFIGS[sensorType] || DEFAULT_SENSOR_CONFIG;
};

// Thêm hàm helper để format thời gian
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Thêm hàm helper để format giá trị với đơn vị
const formatValue = (value: number, unit: string) => {
  return `${value.toFixed(1)}${unit}`;
};

// Thêm styles cho các component với kiểu dữ liệu chính xác
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  } as const,
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  } as const,
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  } as const,
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#334155',
    marginBottom: 16,
  } as const,
  subtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: '#475569',
    marginBottom: 12,
  } as const,
  sensorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#334155',
  } as const,
  sensorType: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as const,
  } as const,
  value: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginTop: 4,
  } as const,
  timestamp: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500' as const,
  } as const,
  minMaxContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
    paddingHorizontal: 10,
  } as const,
  minMaxText: {
    fontSize: 12,
    color: '#64748B',
  } as const,
  chartContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden' as const,
  } as const,
  dotLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as const,
  dotLabelText: {
    fontSize: 12,
    fontWeight: '500' as const,
  } as const,
  actionButton: {
    marginRight: 12,
  } as const,
  actionButtonText: {
    color: '#3B82F6',
  } as const,
  deleteButtonText: {
    color: '#EF4444',
  } as const,
  historyButtonText: {
    color: '#64748B',
  } as const,
};

export default function SensorScreen() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<SensorDetail | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [latestData, setLatestData] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editSensor, setEditSensor] = useState<SensorDetail | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newSensor, setNewSensor] = useState({ SName: '', SType: '', RoomID: '', HomeID: '', APIKey: '' });
  const userID = 1; // Lấy từ context thực tế
  const homeID = 1; // Lấy từ context thực tế
  const [chartData, setChartData] = useState<{ [key: number]: ChartData }>({});
  const screenWidth = Dimensions.get('window').width;

  // Lấy danh sách cảm biến
  useEffect(() => {
    fetchSensors();
  }, []);

  const getToken = async () => await AsyncStorage.getItem('token');

  const fetchSensors = async () => {
    try {
      const token = await getToken();
      const res = await axios.get(API_ENDPOINTS.SENSOR.GET_ALL, {
        params: { userID, homeID },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSensors(res.data.sensors);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể lấy danh sách cảm biến');
    }
  };

  const fetchSensorDetail = async (sensorID: number) => {
    try {
      const token = await getToken();
      const res = await axios.get(API_ENDPOINTS.SENSOR.GET_INFOR, {
        params: { sensorID },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedSensor(res.data.sensor);
      setModalVisible(true);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể lấy chi tiết cảm biến');
    }
  };

  const fetchSensorHistory = async (sensorID: number) => {
    try {
      const token = await getToken();
      const res = await axios.get(API_ENDPOINTS.SENSOR.GET_HISTORY, {
        params: { sensorID },
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Chuyển đổi dữ liệu lịch sử thành định dạng phù hợp cho biểu đồ
      const historyData = res.data.history || [];
      const formattedData = historyData.map((item: any) => ({
        sensorID: sensorID,
        time: item.STime || item.time,
        value: item.NumData || item.value
      }));

      // Cập nhật state history và xử lý dữ liệu cho biểu đồ
      setHistory(historyData);
      processSensorData(formattedData);
      
      // Cập nhật dữ liệu mới nhất
      await fetchLatestData([sensorID]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể lấy lịch sử cảm biến');
    }
  };

  // Thêm useEffect để tự động cập nhật dữ liệu mới nhất
  useEffect(() => {
    if (sensors.length > 0) {
      const sensorIDs = sensors.map(s => s.SensorID);
      fetchLatestData(sensorIDs);
      
      // Cập nhật dữ liệu mỗi 30 giây
      const interval = setInterval(() => {
        fetchLatestData(sensorIDs);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [sensors]);

  const processSensorData = (data: SensorData[]) => {
    const groupedData: { [key: number]: SensorData[] } = {};
    
    data.forEach(item => {
      if (!groupedData[item.sensorID]) {
        groupedData[item.sensorID] = [];
      }
      groupedData[item.sensorID].push(item);
    });

    const newChartData: { [key: number]: ChartData } = {};
    Object.keys(groupedData).forEach(sensorId => {
      const sensorData = groupedData[Number(sensorId)];
      sensorData.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      const recentData = sensorData.slice(-10);
      
      if (recentData.length > 0) {
        const sensor = sensors.find(s => s.SensorID === Number(sensorId));
        const config = getSensorConfig(sensor?.SType || '');
        
        newChartData[Number(sensorId)] = {
          labels: recentData.map(item => formatTime(new Date(item.time))),
          datasets: [{
            data: recentData.map(item => Number(item.value)),
            color: (opacity = 1) => config.color,
            strokeWidth: 3
          }]
        };
      }
    });

    setChartData(newChartData);
  };

  const fetchLatestData = async (sensorIDs: number[]) => {
    try {
      const token = await getToken();
      const ids = sensorIDs.join(',');
      const res = await axios.get(API_ENDPOINTS.SENSOR.GET_DATA, {
        params: { ids },
        headers: { Authorization: `Bearer ${token}` },
      });
      setLatestData(res.data);
      processSensorData(res.data);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể lấy dữ liệu mới nhất');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa cảm biến này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive', onPress: async () => {
          try {
            const token = await getToken();
            await axios.delete(API_ENDPOINTS.SENSOR.DELETE(id), {
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchSensors();
            Alert.alert('Thành công', 'Đã xóa cảm biến');
          } catch (err: any) {
            Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể xóa cảm biến');
          }
        }
      }
    ]);
  };

  const handleAdd = async () => {
    try {
      const token = await getToken();
      await axios.post(API_ENDPOINTS.SENSOR.CREATE, {
        ...newSensor,
        RoomID: Number(newSensor.RoomID),
        HomeID: Number(newSensor.HomeID),
        UserID: userID,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddModalVisible(false);
      setNewSensor({ SName: '', SType: '', RoomID: '', HomeID: '', APIKey: '' });
      fetchSensors();
      Alert.alert('Thành công', 'Đã thêm cảm biến');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể thêm cảm biến');
    }
  };

  const handleEdit = async () => {
    if (!editSensor) return;
    try {
      const token = await getToken();
      await axios.put(API_ENDPOINTS.SENSOR.UPDATE(editSensor.SensorID), editSensor, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditSensor(null);
      setModalVisible(false);
      fetchSensors();
      Alert.alert('Thành công', 'Đã cập nhật cảm biến');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.message || 'Không thể cập nhật cảm biến');
    }
  };

  // Header cho FlatList
  const renderHeader = () => (
    <View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: COLORS.darkGray, marginBottom: 20 }}>
        Quản lý cảm biến
      </Text>
      <Button title="Thêm cảm biến" color={COLORS.primary} onPress={() => setAddModalVisible(true)} />
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 20 }}>Danh sách cảm biến:</Text>
    </View>
  );

  // Footer cho FlatList
  const renderFooter = () => (
    <View>
      {/* Lịch sử cảm biến */}
      {history.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.title}>Lịch sử dữ liệu</Text>
          <FlatList
            data={history}
            keyExtractor={(_, idx) => idx.toString()}
            renderItem={({ item }) => {
              const sensor = sensors.find(s => s.SensorID === item.SensorID);
              const config = getSensorConfig(sensor?.SType || '');
              return (
                <View style={[styles.historyCard, { borderLeftColor: config.color }]}>
                  <Text style={styles.timestamp}>
                    {new Date(item.STime || item.time).toLocaleString()}
                  </Text>
                  <Text style={[styles.value, { color: config.color }]}>
                    {formatValue(item.NumData || item.value, config.unit)}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      )}
      
      {/* Biểu đồ dữ liệu cảm biến */}
      {Object.keys(chartData).length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={styles.title}>Biểu đồ theo dõi</Text>
          {sensors.map(sensor => {
            const data = chartData[sensor.SensorID];
            if (!data || !data.datasets[0].data.length) return null;
            
            const config = getSensorConfig(sensor.SType);
            const minValue = Math.min(...data.datasets[0].data);
            const maxValue = Math.max(...data.datasets[0].data);
            
            return (
              <View key={sensor.SensorID} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={styles.sensorName}>{sensor.SName}</Text>
                  <Text style={[styles.sensorType, { color: config.color }]}>{sensor.SType}</Text>
                </View>
                
                <View style={styles.chartContainer}>
                  <LineChart
                    data={data}
                    width={screenWidth - 72}
                    height={220}
                    chartConfig={{
                      backgroundColor: '#FFFFFF',
                      backgroundGradientFrom: config.gradient[0],
                      backgroundGradientTo: config.gradient[1],
                      decimalPlaces: 1,
                      color: (opacity = 1) => config.color,
                      labelColor: (opacity = 1) => '#64748B',
                      style: {
                        borderRadius: 16,
                      },
                      propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: config.color
                      },
                      propsForBackgroundLines: {
                        strokeDasharray: '5,5',
                        stroke: '#E2E8F0',
                        strokeWidth: 1,
                      },
                      propsForLabels: {
                        fontSize: 11,
                      },
                      fillShadowGradient: config.color,
                      fillShadowGradientOpacity: 0.1,
                    }}
                    bezier
                    style={{
                      marginVertical: 8,
                      borderRadius: 16,
                    }}
                    withInnerLines={true}
                    withOuterLines={true}
                    withVerticalLines={true}
                    withHorizontalLines={true}
                    withDots={true}
                    withShadow={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    fromZero={false}
                    segments={5}
                    renderDotContent={({ x, y, index, indexData }) => (
                      <View
                        key={index}
                        style={[styles.dotLabel, { 
                          position: 'absolute',
                          top: y - 25,
                          left: x - 20,
                          backgroundColor: config.color + '15', // Thêm độ trong suốt
                        }]}
                      >
                        <Text style={[styles.dotLabelText, { color: config.color }]}>
                          {formatValue(indexData, config.unit)}
                        </Text>
                      </View>
                    )}
                  />
                </View>
                
                <View style={styles.minMaxContainer}>
                  <Text style={styles.minMaxText}>
                    Min: {formatValue(minValue, config.unit)}
                  </Text>
                  <Text style={styles.minMaxText}>
                    Max: {formatValue(maxValue, config.unit)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.container}
        data={sensors}
        keyExtractor={item => item.SensorID.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.sensorName}>{item.SName}</Text>
            <Text style={styles.sensorType}>{item.SType}</Text>
            <Text style={styles.timestamp}>RoomID: {item.RoomID} | HomeID: {item.HomeID}</Text>
            <Text style={styles.timestamp}>APIKey: {item.APIKey}</Text>
            <View style={{ flexDirection: 'row' as const, marginTop: 12 }}>
              <TouchableOpacity 
                onPress={() => fetchSensorDetail(item.SensorID)} 
                style={styles.actionButton}
              >
                <Text style={styles.actionButtonText}>Chi tiết</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDelete(item.SensorID)} 
                style={styles.actionButton}
              >
                <Text style={styles.deleteButtonText}>Xóa</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => fetchSensorHistory(item.SensorID)}>
                <Text style={styles.historyButtonText}>Lịch sử</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
      />

      {/* Modal chi tiết & sửa cảm biến */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: COLORS.white }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Chi tiết cảm biến</Text>
          {selectedSensor && (
            <>
              <Text>ID: {selectedSensor.SensorID}</Text>
              <Text>Tên: {selectedSensor.SName}</Text>
              <Text>Loại: {selectedSensor.SType}</Text>
              <Text>Room: {selectedSensor.RoomName}</Text>
              <Text>Home: {selectedSensor.HomeName}</Text>
              <Text>APIKey: {selectedSensor.APIKey}</Text>
              <Text>DataEdge: {selectedSensor.DataEdge}</Text>
              <Button title="Sửa" color={COLORS.primary} onPress={() => setEditSensor(selectedSensor)} />
            </>
          )}
          <Button title="Đóng" color={COLORS.gray} onPress={() => setModalVisible(false)} />
        </ScrollView>
      </Modal>

      {/* Modal sửa cảm biến */}
      <Modal visible={!!editSensor} animationType="slide" onRequestClose={() => setEditSensor(null)}>
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: COLORS.white }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Sửa cảm biến</Text>
          {editSensor && (
            <>
              <TextInput
                placeholder="Tên cảm biến"
                value={editSensor.SName}
                onChangeText={text => setEditSensor({ ...editSensor, SName: text })}
                style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
              />
              <TextInput
                placeholder="Loại cảm biến"
                value={editSensor.SType}
                onChangeText={text => setEditSensor({ ...editSensor, SType: text })}
                style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
              />
              <TextInput
                placeholder="RoomID"
                value={editSensor.RoomID.toString()}
                onChangeText={text => setEditSensor({ ...editSensor, RoomID: Number(text) })}
                style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
              />
              <TextInput
                placeholder="APIKey"
                value={editSensor.APIKey}
                onChangeText={text => setEditSensor({ ...editSensor, APIKey: text })}
                style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
              />
              <Button title="Lưu" color={COLORS.primary} onPress={handleEdit} />
            </>
          )}
          <Button title="Hủy" color={COLORS.gray} onPress={() => setEditSensor(null)} />
        </ScrollView>
      </Modal>

      {/* Modal thêm cảm biến */}
      <Modal visible={addModalVisible} animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: COLORS.white }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Thêm cảm biến mới</Text>
          <TextInput
            placeholder="Tên cảm biến"
            value={newSensor.SName}
            onChangeText={text => setNewSensor({ ...newSensor, SName: text })}
            style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
          />
          <TextInput
            placeholder="Loại cảm biến"
            value={newSensor.SType}
            onChangeText={text => setNewSensor({ ...newSensor, SType: text })}
            style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
          />
          <TextInput
            placeholder="RoomID"
            value={newSensor.RoomID}
            onChangeText={text => setNewSensor({ ...newSensor, RoomID: text })}
            style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
          />
          <TextInput
            placeholder="HomeID"
            value={newSensor.HomeID}
            onChangeText={text => setNewSensor({ ...newSensor, HomeID: text })}
            style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
          />
          <TextInput
            placeholder="APIKey"
            value={newSensor.APIKey}
            onChangeText={text => setNewSensor({ ...newSensor, APIKey: text })}
            style={{ borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, marginBottom: 10, padding: 8 }}
          />
          <Button title="Thêm" color={COLORS.primary} onPress={handleAdd} />
          <Button title="Hủy" color={COLORS.gray} onPress={() => setAddModalVisible(false)} />
        </ScrollView>
      </Modal>
    </>
  );
}
