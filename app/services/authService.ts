import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

// Đăng nhập
export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    throw error;
  }
};

// Đăng ký
// authService.ts
export const register = async (userData: any) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    throw error;
  }
};

export const verifyToken = async (token: string) => {
  try {
    const response = await axios.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return null;
  }
};