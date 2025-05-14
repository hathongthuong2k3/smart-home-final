import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm helper để lấy token từ AsyncStorage
const getAuthToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

// Lấy danh sách thiết bị theo userID và homeID
export const getDevices = async (userID: number, homeID: number) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(API_ENDPOINTS.DEVICE.GET_ALL, {
      params: { userID, homeID },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.devices;
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw error;
  }
};

// Điều khiển thiết bị (bật/tắt)
export const manualControl = async (deviceID: number | string, status: boolean | string) => {
  try {
    const token = await getAuthToken();
    const payload = {
      deviceID: Number(deviceID),
      status: typeof status === 'boolean' ? status : status === 'true',
    };
    console.log('manualControl payload:', payload);
    const response = await axios.post(
      `${API_ENDPOINTS.DEVICE.GET_ALL}/manual-control`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error controlling device:', error?.response?.data || error.message);
    throw error;
  }
};

// Lấy trạng thái thiết bị
export const getDeviceStatus = async (deviceID: number) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      API_ENDPOINTS.DEVICE.GET_STATUS(deviceID),
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error getting device status:', error);
    throw error;
  }
};

// Đổi chế độ thiết bị (Manual/Auto)
export const setDeviceMode = async (deviceID: number | string, modeID: number | string, userID: number | string) => {
  try {
    const token = await getAuthToken();
    const payload = {
      deviceID: Number(deviceID),
      modeID: Number(modeID),
      userID: Number(userID),
    };
    console.log('setDeviceMode payload:', payload);
    const response = await axios.post(
      `${API_ENDPOINTS.DEVICE.GET_ALL}/mode`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error setting device mode:', error?.response?.data || error.message);
    throw error;
  }
};

// Đặt ngưỡng cho thiết bị
export const setDeviceThreshold = async (deviceID: number, threshold: number) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      API_ENDPOINTS.DEVICE.SET_THRESHOLD,
      { deviceID, threshold },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error setting device threshold:', error);
    throw error;
  }
};

// Sửa thông tin thiết bị
export const updateDevice = async (deviceID: number | string, data: any) => {
  try {
    const token = await getAuthToken();
    const response = await axios.put(
      `${API_ENDPOINTS.DEVICE.GET_ALL}/${deviceID}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating device:', error);
    throw error;
  }
};

// Xóa thiết bị
export const deleteDevice = async (deviceID: number | string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.delete(
      `${API_ENDPOINTS.DEVICE.GET_ALL}/${deviceID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting device:', error);
    throw error;
  }
};

// Lấy lịch sử hoạt động thiết bị
export const getDeviceHistory = async (deviceID: number | string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      API_ENDPOINTS.DEVICE.GET_HISTORY,
      {
        params: { deviceID },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error getting device history:', error);
    throw error;
  }
};

// Lấy mode hiện tại của thiết bị
export const getDeviceMode = async (deviceID: number | string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(
      `${API_ENDPOINTS.DEVICE.GET_ALL}/mode/${deviceID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error getting device mode:', error?.response?.data || error.message);
    throw error;
  }
};

// Xác minh mật khẩu thiết bị cửa
export const verifyDoorPassword = async (deviceID: number, inputPassword: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      API_ENDPOINTS.DEVICE.VERIFY_PASSWORD,
      { deviceID, inputPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error verifying door password:', error?.response?.data || error.message);
    throw error;
  }
};

// Đặt mật khẩu cho thiết bị cửa
export const setDoorPassword = async (deviceID: number, password: string) => {
  try {
    const token = await getAuthToken();
    const response = await axios.post(
      API_ENDPOINTS.DEVICE.SET_PASSWORD,
      { deviceID, password },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error setting door password:', error?.response?.data || error.message);
    throw error;
  }
};