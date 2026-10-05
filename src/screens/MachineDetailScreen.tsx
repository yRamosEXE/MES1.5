import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ContingencyPanel } from '../components/contingency/ContingencyPanel';
import { productionLines } from '../data/mockData';
import { getMachineDetail } from '../services/dashboardService';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusBadge } from '../components/StatusBadge';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { Machine } from '../types/models';
import type { RootStackParamList } from '../navigation/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'MachineDetail'>;

export function MachineDetailScreen({ route, navigation }: Props) {
  const { machineId } = route.params;
  const [machine, setMachine] = useState<Machine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setMachine(await getMachineDetail(machineId));
      } catch (error: unknown) {
        console.info('Usando detalhes offline da máquina:', error);
      } finally {
        setLoading(false);
      }
    };
    void fetchDetail();
  }, [machineId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!machine) return <View style={styles.centerContainer}><Text style={styles.empty}>Detalhes indisponíveis.</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title={machine.name || `Máquina #${machineId}`} subtitle={machine.line || 'Detalhes do equipamento'} />
      <View style={styles.card}>
        <Text style={styles.label}>Status Atual:</Text>
        <StatusBadge status={machine.status} />
        <Text style={styles.label}>Linha de Produção: {machine.line || 'N/A'}</Text>
        <Text style={styles.label}>Eficiência (OEE): {'oee' in machine ? `${machine.oee}%` : 'N/A'}</Text>
        <Text style={styles.label}>Sinal: {machine.lastSignal || 'indisponível'} · {machine.temperatureC ?? 0}°C</Text>
        <ContingencyPanel machine={machine} lines={productionLines} onReassign={(id) => navigation.navigate('EmergencyReassignModal', { machineId: id })} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.lg, backgroundColor: colors.surface, marginTop: spacing.md, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 13, marginVertical: 6, color: colors.textPrimary },
  empty: { color: colors.textMuted, fontSize: 12 },
});