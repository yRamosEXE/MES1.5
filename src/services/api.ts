import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANTE: Substitua '192.168.1.100' pelo IP local da sua máquina (veja no ipconfig)
export const API_BASE_URL = 'http://192.168.1.100:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o Token JWT enviado pela Auth do Lucas
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@MES:token');
    if (token) {
      config.headers.Authorization = \Bearer \\;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar o envelope oficial da API NestJS { success, data, message }
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.message || 'Erro na comunicação com a API NestJS';
    return Promise.reject(new Error(errorMessage));
  }
);
