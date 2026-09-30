import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: use o IP da sua máquina na rede local, nunca localhost no mobile
export const API_URL = 'http://172.20.10.3:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para anexar o token JWT automaticamente nas rotas protegidas
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@iot_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});