import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Substitua pelo IP da máquina servidora na sua rede local
export const API_BASE_URL = 'http://172.20.10.3:3000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@iot_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});