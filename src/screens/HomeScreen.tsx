<<<<<<< HEAD
﻿import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDashboardSummary } from '../services/dashboardService';
import { ScreenHeader } from '../components/ScreenHeader';
import { MachineCard } from '../components/MachineCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const CACHE_KEY = '@MES:dashboard_cache';

export const HomeScreen = ({ navigation }: any) => {
  const [machines, setMachines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const response: any = await getDashboardSummary();
      const dataToSave = response?.data?.machines || response?.data || response || [];
      setMachines(Array.isArray(dataToSave) ? dataToSave : []);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Falha na API, carregando dados do cache offline:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setMachines(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando dados da fábrica...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Fábrica em Tempo Real" subtitle="Visão Geral do Parque de Máquinas" />
      <FlatList
        data={machines}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <MachineCard
            machine={item}
            onPress={() => navigation.navigate('MachineDetail', { machineId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma máquina encontrada ou sem conexão.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background || '#F5F5F5',
  },
  loadingText: {
    marginTop: spacing.medium || 12,
    color: colors.textSecondary || '#666',
    fontSize: 14,
  },
  listContent: {
    padding: spacing.medium || 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.large || 24,
  },
  emptyText: {
    color: colors.textSecondary || '#666',
    fontSize: 14,
  },
});
=======
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sessão Autenticada</Text>
        <Text style={styles.subtitle}>Módulo de Autenticação MES 1.5</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Nome:</Text>
          <Text style={styles.infoValue}>{user?.name || 'Carregando...'}</Text>

          <Text style={styles.infoLabel}>E-mail:</Text>
          <Text style={styles.infoValue}>{user?.email || 'Carregando...'}</Text>

          <Text style={styles.infoLabel}>Nível de Acesso (Role):</Text>
          <Text style={styles.badge}>{user?.role || 'OPERADOR'}</Text>
        </View>

        <Text style={styles.handoffNote}>
          Área de métricas e linhas em desenvolvimento por VH / Paulo.
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutText}>Encerrar Sessão</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#334155' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#ffffff', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 20, marginTop: 4 },
  infoBox: { backgroundColor: '#0f172a', padding: 16, borderRadius: 8, marginBottom: 16 },
  infoLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginTop: 8 },
  infoValue: { fontSize: 15, color: '#f8fafc', fontWeight: '500' },
  badge: { color: '#38bdf8', fontWeight: 'bold', fontSize: 14, marginTop: 2 },
  handoffNote: { fontSize: 12, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic', marginBottom: 20 },
  logoutButton: { backgroundColor: '#ef4444', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
});
>>>>>>> origin/develop
