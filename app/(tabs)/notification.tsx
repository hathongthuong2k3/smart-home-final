import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { COLORS } from '../constants/colors';
import { API_ENDPOINTS } from '../constants/api';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5 } from '@expo/vector-icons';
import { Alert } from 'react-native';

interface Notification {
  ID: number;
  Message: string;
  NTime: string;
  NType: string;
  isRead: boolean;
  SName?: string;
  SType?: string;
}

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [userID, setUserID] = useState<string | null>(null);

  // Lấy userID từ AsyncStorage
  useEffect(() => {
    const getUserID = async () => {
      const id = await AsyncStorage.getItem('userID');
      setUserID(id);
    };
    getUserID();
  }, []);

  // Hàm lấy token
  const getAuthToken = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    return token;
  };

  // Hàm fetch notifications
  const fetchNotifications = async (page = 1, isRefresh = false) => {
    if (!userID) return;
    
    try {
      const token = await getAuthToken();
      const response = await axios.get(API_ENDPOINTS.NOTIFICATION.GET_ALL, {
        params: {
          userID,
          page,
          limit: 10,
          isRead: showUnreadOnly ? false : undefined
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const { notifications: newNotifications, currentPage, totalPages } = response.data;
      
      if (isRefresh) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      setCurrentPage(currentPage);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Lỗi', 'Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more khi scroll
  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      fetchNotifications(currentPage + 1);
    }
  };

  // Refresh khi kéo xuống
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(1, true);
  }, [userID, showUnreadOnly]);

  // Load notifications khi component mount hoặc filter thay đổi
  useEffect(() => {
    if (userID) {
      setLoading(true);
      fetchNotifications(1, true);
    }
  }, [userID, showUnreadOnly]);

  // Đánh dấu một thông báo đã đọc
  const handleMarkAsRead = async (id: number) => {
    try {
      const token = await getAuthToken();
      await axios.put(
        `${API_ENDPOINTS.NOTIFICATION.GET_BY_ID(id)}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Cập nhật UI
      setNotifications(prev =>
        prev.map(noti =>
          noti.ID === id ? { ...noti, isRead: true } : noti
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu thông báo đã đọc');
    }
  };

  // Đánh dấu tất cả thông báo đã đọc
  const handleMarkAllAsRead = async () => {
    if (!userID) return;
    
    try {
      const token = await getAuthToken();
      await axios.put(
        `${API_ENDPOINTS.NOTIFICATION.GET_ALL}/mark-all-read/${userID}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Cập nhật UI
      setNotifications(prev =>
        prev.map(noti => ({ ...noti, isRead: true }))
      );
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      Alert.alert('Lỗi', 'Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  // Xóa thông báo khỏi danh sách (chỉ xóa ở UI)
  const handleDeleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(noti => noti.ID !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'DANGER':
        return <FontAwesome5 name="exclamation-triangle" size={24} color="#FF0000" />;
      case 'WARNING':
        return <FontAwesome5 name="exclamation-circle" size={24} color="#FFC107" />;
      case 'INFO':
        return <FontAwesome5 name="info-circle" size={24} color="#2196F3" />;
      default:
        return <FontAwesome5 name="bell" size={24} color="#2196F3" />;
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const isCritical = item.NType.toUpperCase() === 'DANGER';
    const isWarning = item.NType.toUpperCase() === 'WARNING';
    const typeColor = isCritical ? '#FF0000' : isWarning ? '#FFC107' : '#2196F3';

    return (
      <TouchableOpacity 
        style={[styles.notificationContainer, !item.isRead && styles.unreadNotification]}
        onPress={() => !item.isRead && handleMarkAsRead(item.ID)}
      >
        <View style={styles.notificationIcon}>
          {getNotificationIcon(item.NType)}
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.message}>{item.Message}</Text>
          <Text style={styles.time}>{new Date(item.NTime).toLocaleString('vi-VN')}</Text>
          {item.SName && (
            <Text style={styles.sensorInfo}>Thiết bị: {item.SName} ({item.SType})</Text>
          )}
        </View>
        <View style={styles.notificationRight}>
          <Text style={[styles.type, { color: typeColor }]}>{item.NType}</Text>
          <TouchableOpacity 
            onPress={() => handleDeleteNotification(item.ID)}
            style={styles.deleteButton}
          >
            <FontAwesome5 name="times" size={16} color={COLORS.gray} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Thông báo</Text>

      {/* Banner và Filter */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerLeft}>
          <Text style={styles.bannerText}>Xem</Text>
        </View>
        <View style={styles.bannerRight}>
          <TouchableOpacity 
            style={[styles.filterButton, showUnreadOnly && styles.filterButtonActive]}
            onPress={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            <Text style={[styles.filterButtonText, showUnreadOnly && styles.filterButtonTextActive]}>
              Chưa đọc
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.clearButtonText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách thông báo */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.ID.toString()}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {showUnreadOnly ? 'Không có thông báo chưa đọc.' : 'Không có thông báo nào.'}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 20,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginLeft: 10,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.darkGray,
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  clearButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  sensorInfo: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  type: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 4,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});