import { Feather } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Machine } from '../types/models';
import { StatusBadge } from './StatusBadge';

type Props = { machine: Machine; onPress: (machineId: string) => void };

function MachineCardComponent({ machine, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${machine.name}, status ${machine.status}`}
      onPress={() => onPress(machine.id)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.nameWrap}>
          <View style={styles.machineIcon}><Feather name="settings" size={17} color={colors.textSecondary} /></View>
          <Text style={styles.name} numberOfLines={1}>{machine.name}</Text>
        </View>
        <StatusBadge status={machine.status} compact />
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}><Feather name="layers" size={13} color={colors.textMuted} /><Text style={styles.metaText}>{machine.line}</Text></View>
        <View style={styles.metaItem}><Feather name="cpu" size={13} color={colors.textMuted} /><Text style={styles.metaText}>{machine.sensorId}</Text></View>
      </View>
      <View style={styles.footer}>
        <View style={styles.signal}><View style={[styles.signalDot, { backgroundColor: machine.status === 'OFFLINE' ? colors.slate : colors.green }]} /><Text style={styles.signalText}>Sinal {machine.lastSignal}</Text></View>
        <Feather name="chevron-right" size={17} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export const MachineCard = memo(MachineCardComponent);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: spacing.radius, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  pressed: { opacity: 0.86, transform: [{ scale: 0.994 }] },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  nameWrap: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  machineIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  name: { ...typography.subtitle, color: colors.textPrimary, flex: 1 },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  metaText: { ...typography.label, color: colors.textSecondary, fontWeight: '500', flexShrink: 1 },
  footer: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signal: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  signalDot: { width: 6, height: 6, borderRadius: 3 },
  signalText: { ...typography.label, color: colors.textMuted, fontWeight: '500' },
});