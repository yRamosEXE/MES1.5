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
import { getLatestAlerts } from '../services/alertService';
import { ScreenHeader } from '../components/ScreenHeader';
import { AlertCard } from '../components/AlertCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const CACHE_KEY = '@MES:alerts_cache';

export const AlertsFeedScreen = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAlerts = useCallback(async () => {
    try {
      const response: any = await getLatestAlerts();
      const dataToSave = response?.data?.alerts || response?.data || response || [];
      setAlerts(Array.isArray(dataToSave) ? dataToSave : []);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.warn('Falha na API, carregando alertas do cache offline:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setAlerts(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Carregando alertas do sistema...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="Feed de Alertas" subtitle="Ocorrências em tempo real" />
      <FlatList
        data={alerts}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={({ item }) => <AlertCard alert={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum alerta recente registrado.</Text>
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
