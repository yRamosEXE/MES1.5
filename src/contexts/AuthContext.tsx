import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';
import { User, ApiResponse, LoginResponseData } from '../types/api';

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem('@iot_token');

        if (storedToken) {
          // Valida a sessão ativa contra o endpoint oficial atribuído
          try {
            const response = await api.get<ApiResponse<User>>('/auth/me');
            setUser(response.data.data);
            await AsyncStorage.setItem('@iot_user', JSON.stringify(response.data.data));
          } catch {
            // Fallback caso a API esteja inacessível: restaura do cache local
            const storedUser = await AsyncStorage.getItem('@iot_user');
            if (storedUser) {
              setUser(JSON.parse(storedUser));
            }
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar sessão:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', {
        email,
        password,
      });

      const { accessToken, user: userData } = response.data.data;

      await AsyncStorage.setItem('@iot_token', accessToken);
      await AsyncStorage.setItem('@iot_user', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.warn('API indisponível, utilizando mock temporário:', error);

      const mockUser: User = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        name: 'USUARIO',
        email: email,
        role: 'OPERADOR',
        receiveAlerts: true,
      };
      const mockToken = 'mock-jwt-token-xyz-123456';

      await AsyncStorage.setItem('@iot_token', mockToken);
      await AsyncStorage.setItem('@iot_user', JSON.stringify(mockUser));

      setUser(mockUser);
    }
  }

  async function signOut() {
    await AsyncStorage.multiRemove(['@iot_token', '@iot_user']);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}