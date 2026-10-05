import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Alert } from '../types/models';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { alert: Alert; onPress: (machineId: string) => void; index?: number };

export function AlertCard({ alert, onPress, index = 0 }: Props) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const accent = alert.severity === 'critical' ? colors.red : colors.amber;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={() => onPress(alert.machineId)}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      entering={FadeInDown.delay(index * 100).duration(440)}
      style={[styles.card, pressStyle]}
    >
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View style={styles.content}>
        <View style={styles.topline}>
          <View style={[styles.severity, { backgroundColor: alert.severity === 'critical' ? colors.redBackground : colors.amberBackground }]}>
            <View style={[styles.severityDot, { backgroundColor: accent }]} />
            <Text style={[styles.severityText, { color: accent }]}>{alert.severity === 'critical' ? 'CRÍTICO' : 'ATENÇÃO'}</Text>
          </View>
          <Text style={styles.time}>{alert.occurredAt}</Text>
        </View>
        <Text style={styles.title}>{alert.title}</Text>
        <Text style={styles.description}>{alert.description}</Text>
        <View style={styles.machineLine}><Feather name="settings" size={13} color={colors.textMuted} /><Text style={styles.machineName}>{alert.machineName}</Text><Text style={styles.separator}>·</Text><Text style={styles.lineName}>{alert.line}</Text></View>
        <View style={styles.divider} />
        <View style={styles.assigneeRow}>
          <View style={[styles.avatar, { backgroundColor: alert.technician.color }]}><Text style={styles.initials}>{alert.technician.initials}</Text></View>
          <View style={styles.assigneeCopy}><Text style={styles.assigneeName}>{alert.technician.name}</Text><Text style={styles.role}>{alert.technician.role}</Text></View>
          <View style={styles.acknowledgement}>{alert.acknowledged ? <><Feather name="check-circle" size={13} color={colors.green} /><Text style={styles.ackText}>Acionado</Text></> : <><Feather name="clock" size={13} color={colors.amber} /><Text style={[styles.ackText, { color: colors.amber }]}>Pendente</Text></>}</View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', overflow: 'hidden', borderRadius: spacing.radius, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  accent: { width: 4 },
  content: { flex: 1, padding: spacing.lg },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  severity: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 5, borderRadius: spacing.pill },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityText: { ...typography.label, fontSize: 9, letterSpacing: 0.6 },
  time: { ...typography.label, color: colors.textMuted, fontWeight: '500' },
  title: { ...typography.subtitle, color: colors.textPrimary, marginTop: spacing.md },
  description: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  machineLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  machineName: { ...typography.label, color: colors.textSecondary, flexShrink: 1 },
  separator: { color: colors.textMuted },
  lineName: { ...typography.label, color: colors.textMuted, flexShrink: 1 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.md },
  assigneeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 34, height: 34, borderRadius: spacing.pill, alignItems: 'center', justifyContent: 'center' },
  initials: { ...typography.label, color: colors.white, fontSize: 10 },
  assigneeCopy: { flex: 1 },
  assigneeName: { ...typography.label, color: colors.textPrimary },
  role: { ...typography.label, color: colors.textMuted, fontWeight: '400', marginTop: 2, fontSize: 10 },
  acknowledgement: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ackText: { ...typography.label, color: colors.green, fontSize: 10 },
});