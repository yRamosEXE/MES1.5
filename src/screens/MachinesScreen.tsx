import { Feather } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MachineCard } from '../components/MachineCard';
import { ContingencyPanel } from '../components/contingency/ContingencyPanel';
import { ScalePressable } from '../components/ui/ScalePressable';
import { machines, productionLines } from '../data/mockData';
import { colors } from '../theme/colors';
import type { MachineStatus } from '../types/models';

type StatusFilter = 'TODAS' | MachineStatus;
type Props = {
  onOpenMachine: (machineId: string) => void;
  onReassign: (machineId: string) => void;
};

const filters: ReadonlyArray<{ value: StatusFilter; label: string }> = [
  { value: 'TODAS', label: 'Todas' },
  { value: 'OPERANDO', label: 'Operando' },
  { value: 'PARADA', label: 'Paradas' },
  { value: 'MANUTENÇÃO', label: 'Manutenção' },
];

export function MachinesScreen({ onOpenMachine, onReassign }: Props) {
  const [filter, setFilter] = useState<StatusFilter>('TODAS');
  const visibleMachines = useMemo(
    () => machines.filter((machine) => filter === 'TODAS' || machine.status === filter),
    [filter]
  );
  const stoppedCount = machines.filter((machine) => machine.status === 'PARADA').length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.duration(450)} style={styles.header}>
        <Text style={styles.eyebrow}>ATIVOS INDUSTRIAIS</Text>
        <Text style={styles.title}>Máquinas</Text>
        <Text style={styles.subtitle}>{machines.length} equipamentos · {stoppedCount} contingência{stoppedCount === 1 ? '' : 's'} ativa{stoppedCount === 1 ? '' : 's'}</Text>
      </Animated.View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((item) => {
          const selected = filter === item.value;
          return (
            <ScalePressable
              key={item.value}
              onPress={() => setFilter(item.value)}
              accessibilityLabel={`Filtrar máquinas: ${item.label}`}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
            >
              <Text style={[styles.filterText, selected && styles.filterTextSelected]}>{item.label}</Text>
            </ScalePressable>
          );
        })}
      </ScrollView>

      <View style={styles.summaryRow}>
        <View style={styles.summary}><View style={[styles.summaryDot, { backgroundColor: colors.green }]} /><Text style={styles.summaryValue}>{machines.filter((machine) => machine.status === 'OPERANDO').length}</Text><Text style={styles.summaryLabel}>operando</Text></View>
        <View style={styles.summary}><View style={[styles.summaryDot, { backgroundColor: colors.amber }]} /><Text style={styles.summaryValue}>{machines.filter((machine) => machine.status === 'MANUTENÇÃO').length}</Text><Text style={styles.summaryLabel}>manutenção</Text></View>
        <View style={styles.summary}><View style={[styles.summaryDot, { backgroundColor: colors.red }]} /><Text style={styles.summaryValue}>{stoppedCount}</Text><Text style={styles.summaryLabel}>paradas</Text></View>
      </View>

      {visibleMachines.map((machine, index) => (
        <Animated.View key={machine.id} entering={FadeInDown.delay(index * 75).duration(420)} style={styles.machineBlock}>
          <MachineCard machine={machine} index={index} onPress={onOpenMachine} />
          <ContingencyPanel machine={machine} lines={productionLines} onReassign={onReassign} />
        </Animated.View>
      ))}
      {visibleMachines.length === 0 ? <View style={styles.empty}><Feather name="search" size={18} color={colors.textMuted} /><Text style={styles.emptyText}>Nenhuma máquina neste filtro.</Text></View> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 16, paddingBottom: 34 },
  header: { paddingTop: 18, paddingBottom: 16 },
  eyebrow: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  title: { color: colors.textPrimary, fontSize: 25, fontWeight: '800', marginTop: 5 },
  subtitle: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
  filters: { gap: 7, paddingBottom: 14 },
  filterChip: { minHeight: 32, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, paddingHorizontal: 11 },
  filterChipSelected: { borderColor: '#00E67666', backgroundColor: '#00E67618' },
  filterText: { color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  filterTextSelected: { color: colors.green },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 13, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 13, backgroundColor: colors.surface },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  summaryDot: { width: 6, height: 6, borderRadius: 3 },
  summaryValue: { color: colors.textPrimary, fontSize: 11, fontWeight: '800' },
  summaryLabel: { color: colors.textMuted, fontSize: 8 },
  machineBlock: { marginBottom: 8 },
  empty: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8 },
  emptyText: { color: colors.textMuted, fontSize: 11 },
});