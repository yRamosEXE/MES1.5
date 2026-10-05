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
import { getAllAlerts, getLatestAlerts } from '../services/alertService';
import { ScreenHeader } from '../components/ScreenHeader';
import { AlertCard } from '../components/AlertCard';
import { ScalePressable } from '../components/ui/ScalePressable';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { Alert } from '../types/models';

const CACHE_KEY = '@MES:alerts_cache';
type Props = { onOpenMachine?: (machineId: string) => void };
type FeedView = 'latest' | 'history';

export const AlertsFeedScreen = ({ onOpenMachine }: Props) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [feedView, setFeedView] = useState<FeedView>('latest');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadAlerts = useCallback(async () => {
    try {
      const response = feedView === 'latest' ? await getLatestAlerts() : await getAllAlerts(1, 50);
      const dataToSave = Array.isArray(response) ? response : [];
      setAlerts(Array.isArray(dataToSave) ? dataToSave : []);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(dataToSave));
    } catch (error: unknown) {
      console.warn('Falha na API, carregando alertas do cache offline:', error);
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        setAlerts(JSON.parse(cached) as Alert[]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [feedView]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  const onRefresh = () => {
    setRefreshing(true);
    void loadAlerts();
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
      <ScreenHeader title="Central de alertas" subtitle="Ocorrências e histórico industrial" />
      <View style={styles.viewSwitch}>
        {([
          { id: 'latest', label: 'Recentes' },
          { id: 'history', label: 'Histórico' },
        ] as const).map((item) => {
          const selected = feedView === item.id;
          return (
            <ScalePressable
              key={item.id}
              onPress={() => setFeedView(item.id)}
              style={[styles.viewButton, selected && styles.viewButtonSelected]}
              accessibilityLabel={`Abrir ${item.label} de alertas`}
            >
              <Text style={[styles.viewText, selected && styles.viewTextSelected]}>{item.label}</Text>
            </ScalePressable>
          );
        })}
        <Text style={styles.alertCount}>{alerts.length} ocorrências</Text>
      </View>
      <FlatList
        data={alerts}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        renderItem={({ item, index }) => <AlertCard alert={item} onPress={onOpenMachine ?? (() => undefined)} index={index} />}
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
  viewSwitch: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingBottom: 12 },
  viewButton: { minHeight: 31, justifyContent: 'center', paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 9, backgroundColor: colors.surface },
  viewButtonSelected: { borderColor: '#00E67666', backgroundColor: '#00E67618' },
  viewText: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  viewTextSelected: { color: colors.green },
  alertCount: { color: colors.textMuted, fontSize: 8, marginLeft: 'auto' },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.large || 24,
  },
  emptyText: {
    color: colors.textSecondary || '#666',
    fontSize: 14,
  },
});