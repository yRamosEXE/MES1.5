import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RoleBadge, TeamAvatar } from '../team/TeamIdentity';
import type { FactoryRole } from '../../types/team';
import type { Machine, ProductionLine } from '../../types/models';
import { colors } from '../../theme/colors';

type Props = { line?: ProductionLine | null; index: number };

function getEfficiency(line: ProductionLine, machines: Machine[]): number {
  if (Number.isFinite(line.efficiency)) return Math.max(0, Math.min(100, line.efficiency ?? 0));
  const uptimes = machines
    .map((machine) => Number.parseFloat(machine.uptimeToday.replace(',', '.')))
    .filter((value) => Number.isFinite(value));
  if (uptimes.length === 0) return 0;
  return Math.round(uptimes.reduce((total, value) => total + value, 0) / uptimes.length);
}

export function ProductionLineCard({ line, index }: Props) {
  const safeLine: ProductionLine = line && typeof line === 'object' ? line : { title: '', machines: [] };
  const machines = (Array.isArray(safeLine.machines) ? safeLine.machines : []).filter(
    (machine): machine is Machine => Boolean(machine && typeof machine.status === 'string')
  );
  const efficiency = getEfficiency(safeLine, machines);
  const hasStop = machines.some((machine) => machine.status === 'PARADA' || machine.status === 'OFFLINE');
  const hasMaintenance = machines.some((machine) => machine.status === 'MANUTENÇÃO');
  const healthColor = hasStop ? colors.red : hasMaintenance ? colors.amber : colors.green;
  const operator = safeLine.operatorName || 'Equipe de operação';
  const initials = safeLine.operatorInitials || operator.split(' ').map((name) => name[0]).slice(0, 2).join('').toUpperCase();
  const role = safeLine.operatorRole ?? 'OPERADOR';

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(480)} style={styles.row}>
      <View style={[styles.healthRing, { borderColor: healthColor, shadowColor: healthColor }]}>
        <Feather name={hasStop ? 'alert-triangle' : hasMaintenance ? 'tool' : 'activity'} size={14} color={healthColor} />
      </View>
      <View style={styles.lineInfo}>
        <Text numberOfLines={1} style={styles.lineName}>{safeLine.title || 'Linha sem identificação'}</Text>
        <View style={styles.operatorRow}>
          <TeamAvatar name={operator} initials={initials || 'OP'} size={22} />
          <Text numberOfLines={1} style={styles.operator}>{operator}</Text>
        </View>
        <RoleBadge role={role as FactoryRole} />
      </View>
      <View style={styles.efficiencyBlock}>
        <Text style={[styles.efficiency, { color: healthColor }]}>{efficiency}%</Text>
        <Text style={styles.machineCount}>{machines.length} máquinas</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 10 },
  healthRing: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceRaised, shadowOpacity: 0.25, shadowRadius: 8, elevation: 2 },
  lineInfo: { flex: 1, minWidth: 0 },
  lineName: { color: colors.textPrimary, fontSize: 12, fontWeight: '700' },
  operatorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  operator: { color: colors.textMuted, fontSize: 9, flexShrink: 1 },
  efficiencyBlock: { alignItems: 'flex-end', minWidth: 60 },
  efficiency: { fontSize: 15, fontWeight: '800' },
  machineCount: { color: colors.textMuted, fontSize: 8, marginTop: 3 },
});