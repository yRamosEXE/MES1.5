import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, statusPalette } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { MachineStatus } from '../types/models';

type Props = { status: MachineStatus; compact?: boolean };

const statusIcons: Record<MachineStatus, keyof typeof Feather.glyphMap> = {
  OPERANDO: 'activity',
  PARADA: 'alert-circle',
  MANUTENÇÃO: 'tool',
  OFFLINE: 'wifi-off',
};

export function StatusBadge({ status, compact = false }: Props) {
  const palette = statusPalette[status === 'OPERANDO' ? 'operating' : status === 'PARADA' ? 'stopped' : status === 'MANUTENÇÃO' ? 'maintenance' : 'offline'];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }, compact && styles.compact]}>
      <View style={[styles.dot, { backgroundColor: palette.foreground }]} />
      <Text style={[styles.label, { color: palette.foreground }]}>{status}</Text>
    </View>
  );
}

export function StatusIcon({ status, size = 16 }: { status: MachineStatus; size?: number }) {
  const palette = statusPalette[status === 'OPERANDO' ? 'operating' : status === 'PARADA' ? 'stopped' : status === 'MANUTENÇÃO' ? 'maintenance' : 'offline'];
  return <Feather name={statusIcons[status]} size={size} color={palette.foreground} />;
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm, paddingHorizontal: 10, paddingVertical: 7, borderRadius: spacing.pill },
  compact: { paddingHorizontal: 8, paddingVertical: 5, gap: 6 },
  dot: { width: 7, height: 7, borderRadius: spacing.pill },
  label: { ...typography.label, fontSize: 10, letterSpacing: 0.45 },
});

export { colors };