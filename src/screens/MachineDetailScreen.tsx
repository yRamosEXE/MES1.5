import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getMachineDetail } from '../services/dashboardService';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusBadge } from '../components/StatusBadge';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const MachineDetailScreen = ({ route }: any) => {
  const { machineId } = route.params || {};
  const [machine, setMachine] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response: any = await getMachineDetail(machineId);
        setMachine(response?.data || response);
      } catch (error) {
        console.warn('Erro ao carregar detalhes da máquina via API:', error);
      } finally {
        setLoading(false);
      }
    };
    if (machineId) fetchDetail();
  }, [machineId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScreenHeader title={machine?.name || `Máquina #${machineId}`} subtitle={machine?.code || 'Detalhes do Equipamento'} />
      <View style={styles.card}>
        <Text style={styles.label}>Status Atual:</Text>
        <StatusBadge status={machine?.status || 'desconhecido'} />
        <Text style={styles.label}>Linha de Produção: {machine?.line || 'N/A'}</Text>
        <Text style={styles.label}>Eficiência (OEE): {machine?.oee ? `${machine.oee}%` : 'N/A'}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background || '#F5F5F5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: spacing.medium || 16, backgroundColor: '#FFF', margin: spacing.medium || 16, borderRadius: 8 },
  label: { fontSize: 16, marginVertical: 4, color: colors.textPrimary || '#333' },
});
