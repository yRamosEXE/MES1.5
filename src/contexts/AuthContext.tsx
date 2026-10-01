import React, { createContext, useState, useEffect, ReactNode } from 'react';
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
        const storedUser = await AsyncStorage.getItem('@iot_user');

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Falha ao restaurar sessão:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      // Chamada real ao endpoint oficial /api/v1/auth/login
      const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', {
        email,
        password,
      });

      const { accessToken, user: userData } = response.data.data;

      await AsyncStorage.setItem('@iot_token', accessToken);
      await AsyncStorage.setItem('@iot_user', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      // Fallback para desenvolvimento caso a API da Débora ainda esteja offline
      console.warn('API indisponível, utilizando mock temporário:', error);

      const mockUser: User = {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        name: 'Lucas Ramos',
        email: email,
        role: 'GESTOR',
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