import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

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
        console.error('Erro ao recuperar sessão:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    // Simulação temporária de autenticação (Mock)
    const mockUser: User = {
      id: 'usr_101',
      name: 'Lucas Ramos',
      email: email,
    };
    const mockToken = 'mock-jwt-token-xyz-123456';

    // Persistência local no dispositivo
    await AsyncStorage.setItem('@iot_token', mockToken);
    await AsyncStorage.setItem('@iot_user', JSON.stringify(mockUser));

    // Atualização do estado global
    setUser(mockUser);
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