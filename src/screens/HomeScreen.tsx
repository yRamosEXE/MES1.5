import React, { useEffect, useState, useCallback } from 'react';
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
