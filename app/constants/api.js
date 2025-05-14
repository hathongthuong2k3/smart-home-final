// Nếu test trên máy tính: dùng localhost
export const API_URL = "http://192.168.122.56:3003";

// Nếu test trên điện thoại thật: dùng IP LAN của máy tính
// export const API_URL = "http://192.168.x.x:3000";

// Định nghĩa các endpoint
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_URL}/api/auth/login`,
    REGISTER: `${API_URL}/api/auth/register`,
    LOGOUT: `${API_URL}/api/auth/logout`,
    VERIFY_TOKEN: `${API_URL}/api/auth/verify-token`,
  },
  // User endpoints
  USER: {
    GET_ALL: `${API_URL}/api/user`,
    GET_BY_ID: (id) => `${API_URL}/api/user/${id}`,
    CREATE: `${API_URL}/api/user`,
    UPDATE: (id) => `${API_URL}/api/user/${id}`,
    DELETE: (id) => `${API_URL}/api/user/${id}`,
  },
  // Device endpoints
  DEVICE: {
    GET_ALL: `${API_URL}/api/device`,
    GET_BY_ID: (id) => `${API_URL}/api/device/${id}`,
    CREATE: `${API_URL}/api/device`,
    UPDATE: (id) => `${API_URL}/api/device/${id}`,
    DELETE: (id) => `${API_URL}/api/device/${id}`,
    SET_MODE: `${API_URL}/api/device/set-mode`,
    MANUAL_CONTROL: `${API_URL}/api/device/manual-control`,
    GET_STATUS: (id) => `${API_URL}/api/device/status/${id}`,
    SET_THRESHOLD: `${API_URL}/api/device/threshold`,
    GET_HISTORY: `${API_URL}/api/device/history`,
    SET_PASSWORD: `${API_URL}/api/device/set-password`,
    VERIFY_PASSWORD: `${API_URL}/api/device/verify-password`,
  },
  // Sensor endpoints
  SENSOR: {
    GET_ALL: `${API_URL}/api/sensor`,
    CREATE: `${API_URL}/api/sensor`,
    GET_INFOR: `${API_URL}/api/sensor/infor`,
    GET_DATA: `${API_URL}/api/sensor/data`,
    GET_HISTORY: `${API_URL}/api/sensor/history`,
    EXPORT: `${API_URL}/api/sensor/export`,
    UPDATE: (id) => `${API_URL}/api/sensor/${id}`,
    DELETE: (id) => `${API_URL}/api/sensor/${id}`,
  },
  // Schedule endpoints
  SCHEDULE: {
    ADD: `${API_URL}/api/schedule/add-schedule`,
    DELETE: (index) => `${API_URL}/api/schedule/delete-schedule/${index}`,
    UPDATE: `${API_URL}/api/schedule/update-schedule`,
    GET_ALL: `${API_URL}/api/schedule`,
    GET_BY_INDEX: (index) => `${API_URL}/api/schedule/${index}`,
  },
  // Notification endpoints
  NOTIFICATION: {
    GET_ALL: `${API_URL}/api/notification`,
    GET_BY_ID: (id) => `${API_URL}/api/notification/${id}`,
    CREATE: `${API_URL}/api/notification`,
    UPDATE: (id) => `${API_URL}/api/notification/${id}`,
    DELETE: (id) => `${API_URL}/api/notification/${id}`,
  },
  // MQTT endpoints
  MQTT: {
    GET_ALL: `${API_URL}/api/topic`,
    GET_BY_ID: (id) => `${API_URL}/api/topic/${id}`,
    CREATE: `${API_URL}/api/topic`,
    UPDATE: (id) => `${API_URL}/api/topic/${id}`,
    DELETE: (id) => `${API_URL}/api/topic/${id}`,
  },
  USER: {
    GET_ALL: `${API_URL}/api/user`,
    GET_BY_ID: (id) => `${API_URL}/api/user/${id}`,
    UPDATE: (id) => `${API_URL}/api/user/update/${id}`,
    CHANGE_PASS: (id) => `${API_URL}/api/user/change-pass/${id}`,
  },
};