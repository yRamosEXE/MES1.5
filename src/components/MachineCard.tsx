import { Feather } from '@expo/vector-icons';
import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Machine } from '../types/models';
import { StatusBadge } from './StatusBadge';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = { machine: Machine; onPress: (machineId: string) => void; index?: number };

function MachineCardComponent({ machine, onPress, index = 0 }: Props) {
  const scale = useSharedValue(1);
  const radar = useSharedValue(0);
  const isOperating = machine.status === 'OPERANDO';
  const statusColor =
    machine.status === 'OPERANDO'
      ? colors.green
      : machine.status === 'PARADA'
        ? colors.red
        : machine.status === 'MANUTENÇÃO'
          ? colors.amber
          : colors.slate;

  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const radarStyle = useAnimatedStyle(() => ({
    opacity: 0.8 * (1 - radar.value),
    transform: [{ scale: 1 + radar.value * 1.5 }],
  }));

  useEffect(() => {
    if (!isOperating) {
      radar.value = 0;
      return undefined;
    }
    radar.value = withRepeat(withTiming(1, { duration: 1_500 }), -1, false);
    return () => cancelAnimation(radar);
  }, [isOperating, radar]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${machine.name}, status ${machine.status}`}
      onPress={() => onPress(machine.id)}
      onPressIn={() => {
        scale.value = withSpring(0.97);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      entering={FadeInDown.delay(index * 100).duration(440)}
      style={[styles.card, pressStyle]}
    >
      <View style={styles.header}>
        <View style={styles.nameWrap}>
          <View style={styles.machineIcon}>
            <Feather name="settings" size={17} color={colors.textSecondary} />
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {machine.name}
          </Text>
        </View>
        <StatusBadge status={machine.status} compact />
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="layers" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{machine.line}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="cpu" size={13} color={colors.textMuted} />
          <Text style={styles.metaText}>{machine.sensorId}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.signal}>
          <View style={styles.signalIndicator}>
            {isOperating ? <Animated.View style={[styles.radarRing, { backgroundColor: statusColor }, radarStyle]} /> : null}
            <View style={[styles.signalDot, { backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.signalText}>Sinal {machine.lastSignal || 'indisponível'}</Text>
        </View>
        <Feather name="chevron-right" size={17} color={colors.textMuted} />
      </View>
    </AnimatedPressable>
  );
}

export const MachineCard = memo(MachineCardComponent);

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: spacing.radius, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  nameWrap: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  machineIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  name: { ...typography.subtitle, color: colors.textPrimary, flex: 1 },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.lg },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  metaText: { ...typography.label, color: colors.textSecondary, fontWeight: '500', flexShrink: 1 },
  footer: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  signal: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  signalIndicator: { width: 8, height: 8, alignItems: 'center', justifyContent: 'center' },
  radarRing: { position: 'absolute', width: 7, height: 7, borderRadius: 4 },
  signalDot: { width: 5, height: 5, borderRadius: 3 },
  signalText: { ...typography.label, color: colors.textMuted, fontWeight: '500' },
});